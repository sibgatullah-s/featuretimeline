import { TeamSettingsIteration } from "TFS/Work/Contracts";
import { IIterationDisplayOptionsAwareState } from "../../../../Common/modules/IterationDisplayOptions/IterationDisplayActionsContracts";

export interface ITeamSettingsIterationState extends IIterationDisplayOptionsAwareState {
    // project -> team -> Backlog Configuration
    teamSettingsIterations: IDictionaryStringTo<IDictionaryStringTo<TeamSettingsIteration[]>>;
}