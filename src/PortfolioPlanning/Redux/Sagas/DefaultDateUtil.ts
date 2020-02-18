import { PortfolioPlanningFullContentQueryResult } from "../../Models/PortfolioPlanningQueryModels";
import { JsonPatchDocument } from "VSS/WebApi/Contracts";
import { IWorkItem } from "../../Contracts";
import { WorkItemTrackingHttpClient } from "TFS/WorkItemTracking/RestClient";
import * as VSS_Service from "VSS/Service";
import { effects, SagaIterator } from "redux-saga";
import { getWorkItemById } from "../Selectors/EpicTimelineSelectors";

export function* SetDefaultDatesForWorkItems(queryResult: PortfolioPlanningFullContentQueryResult) {
    let workItemsWithoutDates: number[] = [];
    let now, oneMonthFromNow;

    queryResult.items.items.map(item => {
        if (!item.StartDate || !item.TargetDate) {
            now = new Date();
            now.setHours(0, 0, 0, 0);
            oneMonthFromNow = new Date();
            oneMonthFromNow.setHours(0, 0, 0, 0);
            oneMonthFromNow.setDate(now.getDate() + 30);
            workItemsWithoutDates.push(item.WorkItemId);
            item.StartDate = now;
            item.TargetDate = oneMonthFromNow;
        }
    });

    // TODO: Add error handling.
    yield effects.all(workItemsWithoutDates.map(epic => effects.call(saveDatesToServer, epic, now, oneMonthFromNow)));
}

/*
This method is called from two places:
1. setting dates for a selected epic from UI
2. set default dates for newly added epic.
In second case, epic is not saved into state yet.
*/
export function* saveDatesToServer(workItemId: number, defaultStartDate?: Date, defaultEndDate?: Date): SagaIterator {
    console.log("saveDateServer");
    const workItem: IWorkItem = yield effects.select(getWorkItemById, workItemId);
    let startDate: Date = defaultStartDate;
    let endDate: Date = defaultEndDate;

    if (workItem && workItem.startDate && workItem.endDate) {
        startDate = workItem.startDate;
        endDate = workItem.endDate;
    }

    const doc: JsonPatchDocument = [
        {
            op: "add",
            path: "/fields/Microsoft.VSTS.Scheduling.StartDate",
            value: startDate
        },
        {
            op: "add",
            path: "/fields/Microsoft.VSTS.Scheduling.TargetDate",
            value: endDate
        }
    ];

    const witHttpClient: WorkItemTrackingHttpClient = yield effects.call(
        [VSS_Service, VSS_Service.getClient],
        WorkItemTrackingHttpClient
    ); 

    yield effects.call([witHttpClient, witHttpClient.updateWorkItem], doc, workItemId);

    // TODO: Error experience
}

export function* saveOrdersToServer(workItemId: number, custom_order?: number): SagaIterator {
    console.log("saveOrderServer");

    const workItem: IWorkItem = yield effects.select(getWorkItemById, workItemId);

    let order: number = 0;

    if (custom_order) {
        order = custom_order;
        //workItem.custom_order = custom_order; // custom_order is read-only?
        console.log("workItem.id:", workItem.id, "custom_order:", workItem.custom_order);
        console.log("workItemId", workItem.id, "custom_order", custom_order);
    } else if (workItem && workItem.custom_order) {
        order = workItem.custom_order;
        console.log("workItem.custom_order:", workItem.custom_order);
    } 
    console.log("Id:", workItemId, "Order:", order);
    // if (order == 7){
    //     order = 8;
    // } else if (order == 8) {
    //     order = 7;
    // } 

        
    const doc: JsonPatchDocument = [
        {
            op: "add",
            path: "/fields/Custom.order",
            value: order
        }
    ];

    const witHttpClient: WorkItemTrackingHttpClient = yield effects.call(
        [VSS_Service, VSS_Service.getClient],
        WorkItemTrackingHttpClient
    ); 

    yield effects.call([witHttpClient, witHttpClient.updateWorkItem], doc, workItemId);
}
