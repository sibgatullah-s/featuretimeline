import { createSelector } from "reselect";
import { BacklogConfiguration, TeamSettingsIteration } from "TFS/Work/Contracts";
import { WorkItem, WorkItemStateColor } from "TFS/WorkItemTracking/Contracts";
import { IWorkItemDisplayDetails } from "../../../Common/redux/Contracts/GridViewContracts";
import { StateCategory } from "../../../Common/redux/Contracts/types";
import { getWorkItemStateCategory } from "../../../Common/redux/Helpers/getWorkItemStateCategory";
import { backlogConfigurationForProjectSelector } from "../modules/backlogconfiguration/backlogconfigurationselector";
import { teamIterationsSelector } from "../modules/teamIterations/teamIterationSelector";
import { IWorkItemMetadata } from "../modules/workItemMetadata/workItemMetadataContracts";
import { workItemMetadataSelector } from "../modules/workItemMetadata/workItemMetadataSelector";
import { IDependenciesTree } from "../modules/workItems/workItemContracts";
import { normalizedDependencyTreeSelector } from "./dependencyTreeSelector";
import { IEpicTree, normalizedEpicTreeSelector } from "./epicTreeSelector";
import { pagedWorkItemsMapSelector } from "./workItemSelector";
import { WorkItemStartEndIteration, workItemStartEndIterationSelector } from "./workItemStartEndIterationSelector";

export const workItemDisplayDetailsSelectors = createSelector(
    () => 10, //TODO: This is hard coded for now
    normalizedEpicTreeSelector,
    normalizedDependencyTreeSelector,
    pagedWorkItemsMapSelector,
    workItemStartEndIterationSelector,
    backlogConfigurationForProjectSelector,
    teamIterationsSelector as any,
    workItemMetadataSelector,
    getWorkItemDisplayDetails
);
export function getWorkItemDisplayDetails(
    rootWorkItemId: number,
    epicTree: IEpicTree,
    dependencyTree: IDependenciesTree,
    pagedWorkItems: IDictionaryNumberTo<WorkItem>,
    workItemStartEndIterations: WorkItemStartEndIteration,
    backlogConfiguration: BacklogConfiguration,
    teamIterations: TeamSettingsIteration[],
    metadata: IWorkItemMetadata): IWorkItemDisplayDetails[] {

    if (!metadata || !metadata.workItemTypes || !metadata.workItemStateColors) {
        return [];
    }

    const workItems = epicTree.parentToChildrenMap[rootWorkItemId] || [];
    return workItems.map(workItemId => {
        const workItem = pagedWorkItems[workItemId];
        const workItemTypeName = workItem.fields["System.WorkItemType"];
        const state = workItem.fields["System.State"].toLowerCase();
        const title = workItem.fields["System.Title"];
        const workItemType = metadata.workItemTypes.filter((wit) => wit.name.toLowerCase() === workItemTypeName.toLowerCase())[0];
        let workItemStateColor: WorkItemStateColor = null;

        if (metadata.workItemStateColors[workItemTypeName]) {
            workItemStateColor = metadata.workItemStateColors[workItemTypeName].filter(sc => sc.name.toLowerCase() === state)[0];
        }

        const orderFieldName = backlogConfiguration.backlogFields.typeFields["Order"];
        const effortFieldName = backlogConfiguration.backlogFields.typeFields["Effort"];
        const color = workItemType ? "#" + (workItemType.color.length > 6 ? workItemType.color.substr(2) : workItemType.color) : "#c2c8d1";
        const order = workItem.fields[orderFieldName];
        const efforts = workItem.fields[effortFieldName] || 0;
        const iterationDuration = workItemStartEndIterations[workItemId];
        const children = getWorkItemDisplayDetails(
            workItemId,
            epicTree,
            dependencyTree,
            pagedWorkItems,
            workItemStartEndIterations,
            backlogConfiguration,
            teamIterations,
            metadata);
        const childrenWithNoEfforts = children.filter(c => c.efforts === 0).length;
        const stateCategory = getWorkItemStateCategory(workItemTypeName, state, backlogConfiguration.workItemTypeMappedStates);

        const displayDetails: IWorkItemDisplayDetails = {
            id: workItem.id,
            title,
            color,
            order,
            efforts,
            workItem,
            iterationDuration,
            children,
            isRoot: false,
            showInfoIcon: true,
            workItemStateColor,
            childrenWithNoEfforts,
            isComplete: stateCategory === StateCategory.Completed,
            predecessors: dependencyTree.stop[workItem.id],
            successors: dependencyTree.ptos[workItem.id]
        };

        return displayDetails;
    });
}