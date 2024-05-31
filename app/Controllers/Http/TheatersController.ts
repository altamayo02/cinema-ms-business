import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Projector from 'App/Models/Projector';
import Theater from 'App/Models/Theater';
import TheaterValidator from 'App/Validators/TheaterValidator';

export default class TheatersController {
    public async find({ request, params }: HttpContextContract) {
        if (params.id) {
            let theTheater: Theater = await Theater.findOrFail(params.id)
            await theTheater.load("projector")
            await theTheater.load("seats")
            return theTheater;
        } else {
            const data = request.all()
            if ("page" in data && "per_page" in data) {
                const page = request.input('page', 1);
                const perPage = request.input("per_page", 20);
                return await Theater.query().preload("projector").paginate(page, perPage)
            } else {
                return await Theater.query().preload("projector")
            }

        }

    }
    public async create({ request }: HttpContextContract) {
        //const body = request.body();
        const body = await request.validate(TheaterValidator)
        const theTheater: Theater = await Theater.create(body);
        const theProjector: Projector = await Projector.findOrFail(body.projector.id)
        theProjector.theater_id = theTheater.id
        await theProjector.save()
        return theTheater;
    }

    public async update({ params, request }: HttpContextContract) {
        const theTheater: Theater = await Theater.findOrFail(params.id);
        const body = request.body();
        theTheater.location = body.location;
        theTheater.capacity = body.capacity;
        return await theTheater.save();
    }

    public async delete({ params, response }: HttpContextContract) {
        const theTheater: Theater = await Theater.findOrFail(params.id);
        await theTheater.load("projector")
        if (theTheater.projector) {
            response.status(400);
            return {
                "message": "No se puede eliminar, ya que tiene asociado un proyector"
            }
        } else {
            response.status(204);
            return await theTheater.delete();
        }

    }
}
