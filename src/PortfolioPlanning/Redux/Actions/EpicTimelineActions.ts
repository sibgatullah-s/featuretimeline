import { createAction, ActionsUnion } from "../Helpers";
import {
    ProgressTrackingCriteria,
    IAddItems,
    IRemoveItem,
    LoadingStatus,
    IProjectConfiguration
} from "../../Contracts";
import moment = require("moment");
import { PortfolioPlanningFullContentQueryResult } from "../../Models/PortfolioPlanningQueryModels";
import { Action } from "redux";
import { PortfolioTelemetry } from "../../Common/Utilities/Telemetry";

export const enum EpicTimelineActionTypes {
    UpdateDates = "EpicTimeline/UpdateDates",
    ShiftItem = "EpicTimeline/ShiftItem",
    UpdateItemFinished = "EpicTimeline/UpdateItemFinished",
    ToggleItemDetailsDialogHidden = "EpicTimeline/ToggleItemDetailsDialogHidden",
    SetSelectedItemId = "EpicTimeline/SetSelectedItemId",
    PortfolioItemsReceived = "EpicTimeline/PortfolioItemsReceived",
    PortfolioItemDeleted = "EpicTimeline/PortfolioItemDeleted",
    OpenAddItemPanel = "EpicTimeline/OpenAddItemPanel",
    CloseAddItemPanel = "EpicTimeline/CloseAddItemPanel",
    AddItems = "EpicTimeline/AddItems",
    RemoveItems = "EpicTimeline/RemoveItems",
    ToggleProgressTrackingCriteria = "EpicTimeline/ToggleProgressTrackingCriteria",
    ToggleLoadingStatus = "EpicTimeline/ToggleLoadingStatus",
    ResetPlanState = "EpicTimeline/ResetPlanState",
    TogglePlanSettingsPanelOpen = "EpicTimeline/TogglePlanSettingsPanelOpen",
    ToggleIsNewPlanExperience = "EpicTimeline/IsNewPlanExperience",
    ToggleDeletePlanDialogHidden = "EpicTimeline/ToggleDeletePlanDialogHidden",
    HandleGeneralException = "EpicTimeline/HandleGeneralException",
    DismissErrorMessageCard = "EpicTimeline/DismissErrorMessageCard",
    OrderItem = "EpicTimeline/OrderItem"
}

export const EpicTimelineActions = {
    updateDates: (epicId: number, startDate: moment.Moment, endDate: moment.Moment) => {
        PortfolioTelemetry.getInstance().TrackAction(EpicTimelineActionTypes.UpdateDates);
        return createAction(EpicTimelineActionTypes.UpdateDates, {
            epicId,
            startDate,
            endDate
        });
    },
    shiftItem: (itemId: number, startDate: moment.Moment) => {
        console.log("shiftItem 1")
        PortfolioTelemetry.getInstance().TrackAction(EpicTimelineActionTypes.ShiftItem);
        return createAction(EpicTimelineActionTypes.ShiftItem, { itemId, startDate });
    },
    orderItem: (itemId: number, custom_order: number) => {
        console.log("orderItem Id:", itemId, "Order", custom_order);
        console.log("onOrderEpic 1")
        PortfolioTelemetry.getInstance().TrackAction(EpicTimelineActionTypes.OrderItem);
        return createAction(EpicTimelineActionTypes.OrderItem, { itemId, custom_order });
    },
    updateItemFinished: (itemId: number) => {
        return createAction(EpicTimelineActionTypes.UpdateItemFinished, { itemId });
    },
    toggleItemDetailsDialogHidden: (hidden: boolean) =>
        createAction(EpicTimelineActionTypes.ToggleItemDetailsDialogHidden, {
            hidden
        }),
    setSelectedItemId: (id: number) => createAction(EpicTimelineActionTypes.SetSelectedItemId, { id }),
    portfolioItemsReceived: (
        result: PortfolioPlanningFullContentQueryResult,
        projectConfigurations: { [projectId: string]: IProjectConfiguration }
    ) => createAction(EpicTimelineActionTypes.PortfolioItemsReceived, { result, projectConfigurations }),
    portfolioItemDeleted: (itemDeleted: IRemoveItem) =>
        createAction(EpicTimelineActionTypes.PortfolioItemDeleted, itemDeleted),
    openAddItemPanel: () => {
        PortfolioTelemetry.getInstance().TrackAction(EpicTimelineActionTypes.OpenAddItemPanel);
        return createAction(EpicTimelineActionTypes.OpenAddItemPanel);
    },
    closeAddItemPanel: () => createAction(EpicTimelineActionTypes.CloseAddItemPanel),
    addItems: (itemsToAdd: IAddItems) => {
        const count = itemsToAdd && itemsToAdd.items ? itemsToAdd.items.length : 0;
        PortfolioTelemetry.getInstance().TrackAction(EpicTimelineActionTypes.OpenAddItemPanel, { ["Count"]: count });
        return createAction(EpicTimelineActionTypes.AddItems, itemsToAdd);
    },
    removeItems: (itemToRemove: IRemoveItem) => {
        PortfolioTelemetry.getInstance().TrackAction(EpicTimelineActionTypes.RemoveItems);
        return createAction(EpicTimelineActionTypes.RemoveItems, itemToRemove);
    },
    toggleProgressTrackingCriteria: (criteria: ProgressTrackingCriteria) =>
        createAction(EpicTimelineActionTypes.ToggleProgressTrackingCriteria, {
            criteria
        }),
    toggleLoadingStatus: (status: LoadingStatus) =>
        createAction(EpicTimelineActionTypes.ToggleLoadingStatus, { status }),
    resetPlanState: () => createAction(EpicTimelineActionTypes.ResetPlanState),
    togglePlanSettingsPanelOpen: (isOpen: boolean) => {
        PortfolioTelemetry.getInstance().TrackAction(EpicTimelineActionTypes.TogglePlanSettingsPanelOpen, {
            ["isOpen"]: isOpen
        });
        return createAction(EpicTimelineActionTypes.TogglePlanSettingsPanelOpen, { isOpen });
    },
    toggleIsNewPlanExperience: (isNewPlanExperience: boolean) =>
        createAction(EpicTimelineActionTypes.ToggleIsNewPlanExperience, { isNewPlanExperience }),
    toggleDeletePlanDialogHidden: (hidden: boolean) => {
        PortfolioTelemetry.getInstance().TrackAction(EpicTimelineActionTypes.ToggleDeletePlanDialogHidden);
        return createAction(EpicTimelineActionTypes.ToggleDeletePlanDialogHidden, { hidden });
    },
    handleGeneralException: (exception: any) => {
        PortfolioTelemetry.getInstance().TrackException(exception);
        return createAction(EpicTimelineActionTypes.HandleGeneralException, exception);
    },
    dismissErrorMessageCard: () => createAction(EpicTimelineActionTypes.DismissErrorMessageCard)
};

export type EpicTimelineActions = ActionsUnion<typeof EpicTimelineActions>;

export interface PortfolioItemsReceivedAction extends Action {
    type: EpicTimelineActionTypes.PortfolioItemsReceived;
    payload: {
        result: PortfolioPlanningFullContentQueryResult;
        projectConfigurations: {
            [projectId: string]: IProjectConfiguration;
        };
    };
}

export interface PortfolioItemDeletedAction extends Action {
    type: EpicTimelineActionTypes.PortfolioItemDeleted;
    payload: IRemoveItem;
}
