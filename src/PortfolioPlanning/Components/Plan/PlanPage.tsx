import * as React from "react";
import "./PlanPage.scss";
import { Page } from "azure-devops-ui/Page";
import PlanHeader from "./PlanHeader";
import { ConnectedPlanTimeline } from "./PlanTimeline";
import { IPortfolioPlanningState } from "../../Redux/Contracts";
import {
    getProjectNames,
    getTeamNames,
    getSelectedItem,
    getEpicIds,
    getPlanExtendedTelemetry,
    getTimelineItems
} from "../../Redux/Selectors/EpicTimelineSelectors";
import { getSelectedPlanMetadata } from "../../Redux/Selectors/PlanDirectorySelectors";
import { connect } from "react-redux";
import { PlanDirectoryActions } from "../../Redux/Actions/PlanDirectoryActions";
import { EpicTimelineActions } from "../../Redux/Actions/EpicTimelineActions";
import { PortfolioPlanningMetadata } from "../../Models/PortfolioPlanningQueryModels";
import { PlanSettingsPanel } from "./PlanSettingsPanel";
import { ProgressTrackingCriteria, ITimelineItem, LoadingStatus } from "../../Contracts";
import { AddItemPanel } from "./AddItemPanel";
import { Spinner, SpinnerSize } from "azure-devops-ui/Spinner";
import { Link } from "azure-devops-ui/Link";
import { DeletePlanDialog } from "./DeletePlanDialog";
import { MessageCard, MessageCardSeverity } from "azure-devops-ui/MessageCard";
import { PortfolioTelemetry } from "../../Common/Utilities/Telemetry";
import { ExtendedSinglePlanTelemetry } from "../../Models/TelemetryModels";

interface IPlanPageMappedProps {
    plan: PortfolioPlanningMetadata;
    projectNames: string[];
    teamNames: string[];
    epicIds: { [epicId: number]: number };
    selectedItem: ITimelineItem;
    progressTrackingCriteria: ProgressTrackingCriteria;
    addItemPanelOpen: boolean;
    planSettingsPanelOpen: boolean;
    exceptionMessage: string;
    planLoadingStatus: LoadingStatus;
    isNewPlanExperience: boolean;
    deletePlanDialogHidden: boolean;
    planTelemetry: ExtendedSinglePlanTelemetry;
    items: ITimelineItem[];
}

export type IPlanPageProps = IPlanPageMappedProps & typeof Actions;

export default class PlanPage extends React.Component<IPlanPageProps, IPortfolioPlanningState> {
    constructor(props: IPlanPageProps) {
        super(props);
    }

    public render() {
        return (
            <Page className="plan-page">
                {this._renderPlanHeader()}
                {this._renderErrorMessageCard()}
                {this._renderPlanContent()}
                {this._renderAddItemPanel()}
                {this._renderPlanSettingsPanel()}
                {this._renderDeletePlanDialog()}
            </Page>
        );
    }

    public test() {
        this.forceUpdate;
    }

    private _renderPlanHeader = (): JSX.Element => {
        return (
            <PlanHeader
                id={this.props.plan.id}
                name={this.props.plan.name}
                description={this.props.plan.description}
                disabled={!!this.props.exceptionMessage}
                itemIsSelected={!!this.props.selectedItem}
                onAddItemClicked={this.props.onOpenAddItemPanel}
                onBackButtonClicked={this._backButtonClicked}
                onSettingsButtonClicked={this._settingsButtonClicked}
                onDeletePlanButonClicked={() => this.props.toggleDeletePlanDialogHidden(false)}
            />
        );
    };

    private _renderPlanContent = (): JSX.Element => {
        if (this.props.planLoadingStatus === LoadingStatus.NotLoaded) {
            let loadingLabel = "Loading...";
            if (this.props.plan && this.props.plan.name) {
                const suffix = this.props.plan.name.toLowerCase().endsWith("plan") ? "..." : " plan...";
                loadingLabel = `Loading ${this.props.plan.name}${suffix}`;
            }

            return <Spinner className="plan-spinner" label={loadingLabel} size={SpinnerSize.large} />;
        } else {
            PortfolioTelemetry.getInstance().TrackPlanOpened(this.props.plan.id, this.props.planTelemetry);
            return <ConnectedPlanTimeline />;
        }
    };

    private _renderErrorMessageCard = (): JSX.Element => {
        if (this.props.exceptionMessage) {
            if (this.props.exceptionMessage.includes("VS403496")) {
                const helpLink = "https://go.microsoft.com/fwlink/?LinkId=786441";
                const errorMessage =
                    "This plan includes projects that you do not have access to. Update your permissions to view this plan. More information can be found here: ";

                return (
                    <MessageCard
                        className="flex-self-stretch exception-message-card"
                        severity={MessageCardSeverity.Error}
                        onDismiss={this.props.dismissErrorMessageCard}
                    >
                        {errorMessage}
                        <Link href={helpLink} target="_blank">
                            {helpLink}
                        </Link>
                    </MessageCard>
                );
            } else {
                return (
                    <MessageCard
                        className="flex-self-stretch exception-message-card"
                        severity={MessageCardSeverity.Error}
                        onDismiss={this.props.dismissErrorMessageCard}
                    >
                        {this.props.exceptionMessage}
                    </MessageCard>
                );
            }
        }
    };

    private _renderAddItemPanel = (): JSX.Element => {
        if (this.props.addItemPanelOpen || this.props.isNewPlanExperience) {
            return (
                <AddItemPanel
                    planId={this.props.plan.id}
                    epicsInPlan={this.props.epicIds}
                    onCloseAddItemPanel={this.props.onCloseAddItemPanel}
                    onAddItems={this.props.onAddItems}
                />
            );
        }
    };

    private _renderPlanSettingsPanel = (): JSX.Element => {
        if (this.props.planSettingsPanelOpen) {
            return (
                <PlanSettingsPanel
                    progressTrackingCriteria={this.props.progressTrackingCriteria}
                    onProgressTrackingCriteriaChanged={this.props.onToggleProgressTrackingCriteria}
                    onClosePlanSettingsPanel={() => {
                        this.props.onTogglePlanSettingsPanelOpen(false);
                    }}
                    items={this.props.items}
                    onColorChanged={this.props.onToggleProgressTrackingCriteria}
                />
            );
        }
    };

    private _renderDeletePlanDialog = (): JSX.Element => {
        if (!this.props.deletePlanDialogHidden) {
            return (
                <DeletePlanDialog
                    onDismiss={() => this.props.toggleDeletePlanDialogHidden(true)}
                    onDeleteClicked={this._deletePlanButtonClicked}
                />
            );
        }
    };

    private _backButtonClicked = (): void => {
        this.props.toggleSelectedPlanId(undefined);
        this.props.resetPlanState();
    };

    private _deletePlanButtonClicked = (): void => {
        this.props.deletePlan(this.props.plan.id);
        this.props.toggleDeletePlanDialogHidden(true);
        this.props.resetPlanState();
    };

    private _settingsButtonClicked = (): void => {
        this.props.onTogglePlanSettingsPanelOpen(true);
    };
}

function mapStateToProps(state: IPortfolioPlanningState): IPlanPageMappedProps {
    return {
        plan: getSelectedPlanMetadata(state),
        projectNames: getProjectNames(state),
        teamNames: getTeamNames(state),
        epicIds: getEpicIds(state.epicTimelineState),
        selectedItem: getSelectedItem(state.epicTimelineState),
        progressTrackingCriteria: state.epicTimelineState.progressTrackingCriteria,
        addItemPanelOpen: state.epicTimelineState.addItemsPanelOpen,
        planSettingsPanelOpen: state.epicTimelineState.planSettingsPanelOpen,
        exceptionMessage: state.epicTimelineState.exceptionMessage,
        planLoadingStatus: state.epicTimelineState.planLoadingStatus,
        isNewPlanExperience: state.epicTimelineState.isNewPlanExperience,
        deletePlanDialogHidden: state.epicTimelineState.deletePlanDialogHidden,
        planTelemetry: getPlanExtendedTelemetry(state.epicTimelineState),
        items: getTimelineItems(state.epicTimelineState)
    };
}

const Actions = {
    deletePlan: PlanDirectoryActions.deletePlan,
    toggleSelectedPlanId: PlanDirectoryActions.toggleSelectedPlanId,
    resetPlanState: EpicTimelineActions.resetPlanState,
    onOpenAddItemPanel: EpicTimelineActions.openAddItemPanel,
    onToggleProgressTrackingCriteria: EpicTimelineActions.toggleProgressTrackingCriteria,
    onCloseAddItemPanel: EpicTimelineActions.closeAddItemPanel,
    onAddItems: EpicTimelineActions.addItems,
    onTogglePlanSettingsPanelOpen: EpicTimelineActions.togglePlanSettingsPanelOpen,
    toggleDeletePlanDialogHidden: EpicTimelineActions.toggleDeletePlanDialogHidden,
    dismissErrorMessageCard: EpicTimelineActions.dismissErrorMessageCard
};

export const ConnectedPlanPage = connect(
    mapStateToProps,
    Actions
)(PlanPage);
