import mongoose from "mongoose";
import httpErrors from "http-errors";
import httpStatus from "http-status";


class DBService {
    private _model: mongoose.Model<any, unknown, unknown, unknown, any>;

    constructor(modelName: string) {
        this._model = mongoose.model(modelName);
    }

    public getModelInstance = (): mongoose.Model<any, unknown, unknown, unknown, any> => {
        return this._model;
    };

    public normalizeObject = (obj: { [key: string]: any }) => {
        if (typeof obj?.toObject === "function") {
            obj = obj.toObject();
        }

        return obj;
    };

    public updateById = async (id: mongoose.Types.ObjectId | string, updRec: { [key: string]: any }, opts?: { [key: string]: any }) => {
        let options = { new: true };

        const updatedObjectInstance = await this._model.findOneAndUpdate(
            { _id: id },
            updRec,
            options
        );
        if (!updatedObjectInstance) {
            throw httpErrors(
                httpStatus.NOT_FOUND,
                `${this._model.name} item with ${id} could not be updated`
            );
        }
        console.info(`${this._model.name} item with id: ${id} updated successfully`);

        return updatedObjectInstance;
    }

    public updateOne = async (query: { [key: string]: any }, updRec: { [key: string]: any }, opts?: { [key: string]: any }) => {
        let options = { new: true };
        if (opts) {
            options = { ...options, ...opts };
        }
        const updatedObjectInstance = await this._model.findOneAndUpdate(
            query,
            updRec,
            options
        );
        if (!updatedObjectInstance) {
            throw httpErrors(
                httpStatus.NOT_FOUND,
                `${this._model.name} item with ${updatedObjectInstance?._id} could not be updated`
            );
        }
        console.info(
            `${this._model.name} item with id: ${updatedObjectInstance?._id} updated successfully`
        );

        return updatedObjectInstance;
    }

    public getById = async (
        id: mongoose.Types.ObjectId,
        { noErr = false, projections = {}, populateQuery = [] }: {
            noErr?: boolean,
            projections?: { [key: string]: any },
            populateQuery?: string[] | string
        } = {}
    ) => {

        const result = await this._model.findById(id, projections).populate(populateQuery).lean();
        if (!result && !noErr) {
            throw httpErrors(
                httpStatus.NOT_FOUND,
                `${this._model.name} item with id - ${id} could not be found`
            );
        }
        console.info(`${this._model.name} item with id - ${id} fetched successfully`);

        return result;
    };

    public getByQuery = async (
        query: { [key: string]: any },
        { noErr = false, projections = {}, populateQuery = [], skip = 0, limit = 0, sort = {} }: {
            noErr?: boolean,
            projections?: { [key: string]: any },
            populateQuery?: string[] | string,
            skip?: number,
            limit?: number,
            sort?: { [key: string]: any }
        } = {}
    ) => {
        const result = await this._model
            .find(query, projections)
            .populate(populateQuery)
            .skip(skip)
            .limit(limit)
            .sort(sort)
            .lean();

        if (!result && !noErr) {
            throw httpErrors(httpStatus.NOT_FOUND, `No ${this._model.name} item found`);
        }
        console.info(`${this._model.name} items fetched successfully`);

        return result;
    };

    public getOneByQuery = async (
        query: { [key: string]: any },
        { noErr = false, projections = {}, populateQuery = [], skip = 0 }: {
            noErr?: boolean,
            projections?: { [key: string]: any },
            populateQuery?: string[] | string,
            skip?: number,
        } = {}
    ) => {
        const result = await this._model
            .findOne(query, projections)
            .populate(populateQuery)
            .skip(skip)
            .lean();
        if (!result && !noErr) {
            throw httpErrors(httpStatus.NOT_FOUND, `No ${this._model.name} item found`);
        }
        console.info(`${this._model.name} items fetched successfully`);

        return result;
    };

    public paginate = async (
        query: { [key: string]: any },
        { projections = {}, populateQuery = [], page = 1, limit = 30, sort = {} }: {
            noErr?: boolean,
            projections?: { [key: string]: any },
            populateQuery?: string[] | string,
            page?: number,
            limit?: number,
            sort?: { [key: string]: any }
        } = {}
    ) => {
        if (page <= 0 || limit <= 0) {
            throw httpErrors(
                httpStatus.BAD_REQUEST,
                `page or limit cannot be 0 or negative`
            );
        }
        const skip = (page - 1) * limit;

        const docs = await this._model
            .find(query, projections)
            .populate(populateQuery)
            .sort(sort)
            .skip(skip)
            .limit(limit) // sorts the data
            .lean();

        const total = await this.getCount(query);
        const pages = Math.ceil(total / limit);
        const result = {
            docs,
            total,
            limit,
            page,
            pages,
        };
        console.info(`${this._model.name} items fetched successfully`);

        return result;
    }


    public getCount = async (query: { [key: string]: any }) => {
        return await this._model.find(query).count();
    };

    public aggregate = async (aggregationPipeline: any[]) => {
        return await this._model.aggregate(aggregationPipeline);
    };

    public updateMany = async (query: { [key: string]: any }, updRec: { [key: string]: any }, opts?: { [key: string]: any }) => {
        let options = { new: true };
        if (opts) {
            options = { ...options, ...opts };
        }

        const result = await this._model.updateMany(query, updRec, options);
        if (!result) {
            throw httpErrors(
                httpStatus.NOT_FOUND,
                `${this._model.name} items could not be updated`
            );
        }
        console.info(
            `${this._model.name} updated successfully`
        );
        return result;
    }

    public deleteById = async (id: mongoose.Types.ObjectId | string) => {
        const deletedObjectInstance = await this._model.findOneAndRemove({ _id: id });
        if (!deletedObjectInstance) {
            throw httpErrors(
                httpStatus.NOT_FOUND,
                `${this._model.name} item with id: ${id} could not be deleted`
            );
        }
        console.info(`${this._model.name} item with id: ${id} deleted successfully`);

        return { id };
    }

    public deleteMany = async (query: { [key: string]: any }) => {
        try {
            await this._model.deleteMany(query);
        } catch (error) {
            throw error;
        }
        console.info(`${this._model.name} items deleted successfully`);
        return true;
    }

    public insertOne = async (data: { [key: string]: any }) => {
        let newObjectInstance = new this._model(data);
        newObjectInstance = await newObjectInstance.save();
        console.info(`${this._model.name} item inserted successfully`);
        return newObjectInstance;
    }

    public insertMany = async (data: { [key: string]: any }[], opts: { [key: string]: any }) => {
        let options = Object.assign({ ordered: false });
        if (opts) {
            options = { ...options };
        }
        const result = await this._model.insertMany(data, options);
        console.info(`${this._model.name} many entries inserted successfully`);
        return result;
    }
};

export default DBService;