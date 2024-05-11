import DBService from "@/services/db.service";
import { Form } from "./form.interface";
import FormModel from "@/resources/form/models/form.model";
import FieldModel, { FieldDocument } from "./models/field.model";

class FormService {
  private db = new DBService("forms");
  private dbForms = new DBService("fields");

  public async createForm(form: Form): Promise<Form> {
    return await FormModel.create(form);
  }

  public async deActivateForms(): Promise<any> {
    return await this.db.updateMany({}, { is_active: false });
  }

  public async deActivateFields(parent_id: string): Promise<any> {
    return await this.dbForms.updateMany({ parent_id }, { is_active: false });
  }

  public async createFieldConfig(
    fieldData: FieldDocument
  ): Promise<FieldDocument> {
    return await FieldModel.create(fieldData);
  }

  public async getLatestConfig(
    flow_id?: string | null,
    config_ids?: Array<string> | null
  ): Promise<any> {
    let form_flow = await this.db.getOneByQuery(
      flow_id ? { flow_id } : { is_active: true },
      {
        noErr: true,
      }
    );

    let form_fields = await this.dbForms.getByQuery(
      config_ids
        ? {
            config_id: { $in: config_ids },
          }
        : {
            $or: [
              { parent_id: "pers_1", is_active: true },
              { parent_id: "edu_2", is_active: true },
              { parent_id: "pro_3", is_active: true },
              { parent_id: "doc_4", is_active: true },
            ],
          },
      {
        noErr: true,
      }
    );

    return {
      form_flow,
      form_fields,
    };
  }

  public async getActiveFieldsById(parent_id: string): Promise<any> {
    let form_fields = await this.dbForms.getOneByQuery(
      {
        parent_id,
        is_active: true,
      },
      {
        noErr: true,
      }
    );

    return form_fields;
  }
}

export default FormService;
