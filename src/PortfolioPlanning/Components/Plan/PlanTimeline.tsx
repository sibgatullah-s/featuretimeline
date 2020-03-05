import * as React from "react";
import * as moment from "moment";
import { ITimelineGroup, ITimelineItem, ITeam, ProgressTrackingCriteria, IProject } from "../../Contracts";
import Timeline, { TimelineHeaders, DateHeader } from "react-calendar-timeline";
import "./PlanTimeline.scss";
import { IPortfolioPlanningState } from "../../Redux/Contracts";
import {
    getTimelineGroups,
    getTimelineItems,
    getProjectNames,
    getTeamNames,
    getIndexedProjects
} from "../../Redux/Selectors/EpicTimelineSelectors";
import { EpicTimelineActions } from "../../Redux/Actions/EpicTimelineActions";
import { connect } from "react-redux";
import { ProgressDetails } from "../../Common/Components/ProgressDetails";
import { getSelectedPlanOwner } from "../../Redux/Selectors/PlanDirectorySelectors";
import { IdentityRef } from "VSS/WebApi/Contracts";
import { ZeroData, ZeroDataActionType } from "azure-devops-ui/ZeroData";
import { PortfolioTelemetry } from "../../Common/Utilities/Telemetry";
import { Image, IImageProps, ImageFit } from "office-ui-fabric-react/lib/Image";
import { Slider } from "office-ui-fabric-react/lib/Slider";
import { Button } from "azure-devops-ui/Button";
import { PlanSummary } from "./PlanSummary";
import { MenuButton } from "azure-devops-ui/Menu";
import { IconSize } from "azure-devops-ui/Icon";
import { DetailsDialog } from "./DetailsDialog";
import { ConnectedDependencyPanel } from "./DependencyPanel";
//import { NotificationReasonType } from "Notifications/Contracts";
//import { GroupScopeType } from "VSS/Identities/Contracts";

const day = 60 * 60 * 24 * 1000;
const week = day * 7;
const sliderSteps = 50;
const maxZoomIn = 20 * day;
// const to store id of html elements related to color for color picker
// const colorDict = {"workcol": "progress-completed", "rworkcol": "progressrwork-completed", "cworkcol": "progresscwork-completed", "nworkcol": "progress-details-parts", "rnworkcol": "progressrwork-details-parts", "cnworkcol": "progresscwork-details-parts"};
var c1, c2, c3, c4, c5, c6;

export {c1}; 
export {c2}; 
export {c3}; 
export {c4}; 
export {c5}; 
export {c6};

type Unit = `second` | `minute` | `hour` | `day` | `month` | `year`;

interface LabelFormat {
    long: string;
    mediumLong: string;
    medium: string;
    short: string;
}

interface IPlanTimelineMappedProps {
    planId: string;
    groups: ITimelineGroup[];
    projectNames: string[];
    teamNames: string[];
    teams: { [teamId: string]: ITeam };
    items: ITimelineItem[];
    selectedItemId: number;
    planOwner: IdentityRef;
    exceptionMessage: string;
    setDatesDialogHidden: boolean;
    progressTrackingCriteria: ProgressTrackingCriteria;
    projects: { [projectIdKey: string]: IProject };
}

interface IPlanTimelineState {
    sliderValue: number;
    visibleTimeStart: moment.Moment;
    visibleTimeEnd: moment.Moment;
    contextMenuItem: ITimelineItem;
    dependencyPanelOpen: boolean;
}

export type IPlanTimelineProps = IPlanTimelineMappedProps & typeof Actions;

export class PlanTimeline extends React.Component<IPlanTimelineProps, IPlanTimelineState> {
    private defaultTimeStart: moment.Moment;
    private defaultTimeEnd: moment.Moment;

    constructor() {
        super();

        this.state = {
            sliderValue: 0,
            visibleTimeStart: undefined,
            visibleTimeEnd: undefined,
            contextMenuItem: undefined,
            dependencyPanelOpen: false
        };
    }

    // function to render top part of timeline with info and zoom settings
    public render(): JSX.Element {
        return (
            <>
                <div className="plan-timeline-summary-container">
                    {this._renderSummary()}
                    {this._renderZoomControls()}
                </div>
                {this._renderTimeline()}
                {this._renderItemDetailsDialog()}
                {this._renderDependencyPanel()}
            </>
        );
    }

    private _renderSummary(): JSX.Element {
        return (
            <PlanSummary
                projectNames={this.props.projectNames}
                teamNames={this.props.teamNames}
                owner={this.props.planOwner}
            />
        );
    }

    private _renderItemDetailsDialog = (): JSX.Element => {
        if (this.state.contextMenuItem) {
            return (
                <DetailsDialog
                    key={Date.now()} // TODO: Is there a better way to reset the state?
                    id={this.state.contextMenuItem.id}
                    title={this.state.contextMenuItem.title}
                    startDate={this.state.contextMenuItem.start_time}
                    endDate={this.state.contextMenuItem.end_time}
                    hidden={this.props.setDatesDialogHidden}
                    save={(id, startDate, endDate) => {
                        this.props.onUpdateDates(id, startDate, endDate);
                    }}
                    close={() => {
                        this.props.onToggleSetDatesDialogHidden(true);
                    }}
                />
            );
        }
    };

    private _renderDependencyPanel(): JSX.Element {
        if (this.state.contextMenuItem && this.state.dependencyPanelOpen) {
            return (
                <ConnectedDependencyPanel
                    workItem={this.state.contextMenuItem}
                    projectInfo={this.props.projects[this.state.contextMenuItem.projectId.toLowerCase()]}
                    progressTrackingCriteria={this.props.progressTrackingCriteria}
                    onDismiss={() => this.setState({ dependencyPanelOpen: false })}
                />
            );
        }
    }

    // color picker to change color of elements
    // private _changeColor(): JSX.Element {
    //     console.log("testingtesting33");
    //     console.log("testingtesting", this.props);
    //     console.log("testevent2");

    //     //console.log("testlocalhost");
    //     // check if cookies exist with color otherwise set to default colors, check if this gets rerun multiple times in one session

    //     // document.cookie = 'workcol=limegreen';
    //     // document.cookie = 'rworkcol=red';
    //     // document.cookie = 'cworkcol=blue';
    //     // document.cookie = 'nworkcol=lightgrey';
    //     // document.cookie = 'rnworkcol=darkorchid';
    //     // document.cookie = 'cnworkcol=lightskyblue';

    //     if (document.cookie.search(new RegExp("\\b" + "workcol" + "\\b")) !== -1) {
    //         console.log("check1", c1);
    //         c1 = document.cookie.substring(document.cookie.search(new RegExp("\\b" + "workcol" + "\\b")) + 8, document.cookie.indexOf(";", document.cookie.search(new RegExp("\\b" + "workcol" + "\\b"))));
    //         console.log("check2", c1);
    //     } else {
    //         console.log("testevent1");
    //         document.cookie = "workcol=#32CD32";
    //         c1 = "#32CD32";
    //     }
    //     if (document.cookie.search(new RegExp("\\b" + "rworkcol" + "\\b")) !== -1) {
    //         c2 = document.cookie.substring(document.cookie.search(new RegExp("\\b" + "rworkcol" + "\\b")) + 9, document.cookie.indexOf(";", document.cookie.search(new RegExp("\\b" + "rworkcol" + "\\b"))));
    //     } else {
    //         console.log("testevent2");
    //         document.cookie = "rworkcol=#FF0000";
    //         c2 = "#FF0000"
    //     }

    //     if (document.cookie.search(new RegExp("\\b" + "cworkcol" + "\\b")) !== -1) {
    //         c3 = document.cookie.substring(document.cookie.search(new RegExp("\\b" + "cworkcol" + "\\b")) + 9, document.cookie.indexOf(";", document.cookie.search(new RegExp("\\b" + "cworkcol" + "\\b"))));
    //     } else {
    //         console.log("testevent3");
    //         document.cookie = "cworkcol=#0000FF";
    //         c3 = "#0000FF"
    //     }

    //     if (document.cookie.search(new RegExp("\\b" + "nworkcol" + "\\b")) !== -1) {
    //         c4 = document.cookie.substring(document.cookie.search(new RegExp("\\b" + "nworkcol" + "\\b")) + 9, document.cookie.indexOf(";", document.cookie.search(new RegExp("\\b" + "nworkcol" + "\\b"))));
    //     } else {
    //         console.log("testevent4");
    //         document.cookie ="nworkcol=#D3D3D3";
    //         c4 = "#D3D3D3"
    //     }

    //     if (document.cookie.search(new RegExp("\\b" + "rnworkcol" + "\\b")) !== -1) {
    //         c5 = document.cookie.substring(document.cookie.search(new RegExp("\\b" + "rnworkcol" + "\\b")) + 10, document.cookie.indexOf(";", document.cookie.search(new RegExp("\\b" + "rnworkcol" + "\\b"))));
    //     } else {
    //         console.log("testevent5");
    //         document.cookie = "rnworkcol=#9932cc";
    //         c5 = "#9932cc"
    //     }

    //     if (document.cookie.search(new RegExp("\\b" + "cnworkcol" + "\\b")) !== -1) {
    //         console.log("test1010gothere");
    //         c6 = document.cookie.substring(document.cookie.search(new RegExp("\\b" + "cnworkcol" + "\\b")) + 10, document.cookie.indexOf(";", document.cookie.search(new RegExp("\\b" + "cnworkcol" + "\\b"))));
    //     } else {
    //         console.log("testevent6");
    //         document.cookie = "cnworkcol=#87cefa";
    //         c6 = "#87cefa"
    //     }


    //     console.log("cookie", document.cookie);
    //     console.log("values", c1, c2, c3, c4, c5, c6);

    //     // !! set values of color picker to values fro mcookie
    //     return (
    //         <div className="plan-timeline-change-color">
    //         </div>
    //     );
    // }

    // private onChange1 = event => {
    //     document.cookie = "workcol=" + String($("#color-picker1").val());
    //     var x = document.getElementsByClassName("progress-completed");
    //     var i;
    //     for (i = 0; i < x.length; i++) {
    //         x[i]["style"].background = $("#color-picker1").val();
    //     }
    //     console.log("testeventchange1", c1);
    //     c1 = $("#color-picker1").val();
    //     console.log("testeventchange1", c1);
    //     document.getElementById("color-picker1")["value"] = $("#color-picker1").val();
    //     document.getElementById("color-picker1")["defaultValue"] = $("#color-picker1").val();
    //     console.log("testeventchange1", document.cookie);
    //     console.log("testeventchange1", document.getElementById("color-picker1")["value"], document.getElementById("color-picker1")["defaultValue"]);
        
    // };


    // update cookie, update value of color picker?, update css value background
    // private onColorChange = event => {
    //     // update cookie to new color
    //     console.log("testevent", $(event.target.id).val(), event.target); // event.target.(id(color picker), value(value of color))
    //     document.cookie = event.target.parentElement.parentElement.id + "=" + String($("#" + event.target.id).val());
    //     console.log("testevent", document.cookie);
    //     //console.log("testevent", $("#" + event.target.id).val());
    //     //console.log("testevent " + event.target.parentElement.parentElement.id + "=" + String($(event.target.id).val()));
    //     //var elem = event.target.parentElement.parentElement.id;
    //     // update all css values with new color
    //     //var test = document.getElementsByClassName("progresscwork-details-parts");
    //     // console.log("dict", colorDict[event.target.parentElement.parentElement.id]);
    //     var x = document.getElementsByClassName(colorDict[event.target.parentElement.parentElement.id]);
    //     var i;
    //     for (i = 0; i < x.length; i++) {
    //         console.log("testevent1", x[i]);
    //         // if(($("#" + event.target.id).val() == "#0000ff") || ($("#" + event.target.id).val() == "#87cefa")){
    //         //     console.log("testeventwhy");
    //         // }
    //         x[i]["style"].background = $("#" + event.target.id).val();
    //     };

    //     // console.log("testevent2.01", event.target);
    //     // console.log("testevent2.1", document.getElementById(event.target.id)["value"] = $("#" + event.target.id).val(), document.getElementById(event.target.id)["defaultValue"] = $("#" + event.target.id).val());
    //     // console.log("testeventpickervalue",  document.getElementById(event.target.id)["value"]);

    //     // call function to re-render to update color-picker color
    //     // !! warning, re-rendering by calling could also call shift on first item but not change time
    //     try {
    //         //console.log("testingtesting", this.props.onSetSelectedItemId(this.props.items[0].id));
    //         console.log("testingtesting", this._onItemMove(this.props.items[0].id, Date.parse(this.props.items[0].start_time["_i"])));
    //         // ! very ineffecient, will this always work?
    //         // unhighlight first item which was highlighted previously
            
    //     } finally {

    //     }
        
    // };




    private _renderZoomControls(): JSX.Element {
        // inserting color-picker value code here ??? is this needed
        console.log("testingtesting33");
        console.log("testingtesting", this.props);
        console.log("testevent2");

        //console.log("testlocalhost");
        // check if cookies exist with color otherwise set to default colors, check if this gets rerun multiple times in one session

        // document.cookie = 'workcol=limegreen';
        // document.cookie = 'rworkcol=red';
        // document.cookie = 'cworkcol=blue';
        // document.cookie = 'nworkcol=lightgrey';
        // document.cookie = 'rnworkcol=darkorchid';
        // document.cookie = 'cnworkcol=lightskyblue';

        if (document.cookie.search(new RegExp("\\b" + "workcol" + "\\b")) !== -1) {
            console.log("check1", c1);
            c1 = document.cookie.substring(document.cookie.search(new RegExp("\\b" + "workcol" + "\\b")) + 8, document.cookie.indexOf(";", document.cookie.search(new RegExp("\\b" + "workcol" + "\\b"))));
            console.log("check2", c1);
        } else {
            console.log("testevent1");
            document.cookie = "workcol=#32CD32";
            c1 = "#32CD32";
        }
        if (document.cookie.search(new RegExp("\\b" + "rworkcol" + "\\b")) !== -1) {
            c2 = document.cookie.substring(document.cookie.search(new RegExp("\\b" + "rworkcol" + "\\b")) + 9, document.cookie.indexOf(";", document.cookie.search(new RegExp("\\b" + "rworkcol" + "\\b"))));
        } else {
            console.log("testevent2");
            document.cookie = "rworkcol=#FF0000";
            c2 = "#FF0000"
        }

        if (document.cookie.search(new RegExp("\\b" + "cworkcol" + "\\b")) !== -1) {
            c3 = document.cookie.substring(document.cookie.search(new RegExp("\\b" + "cworkcol" + "\\b")) + 9, document.cookie.indexOf(";", document.cookie.search(new RegExp("\\b" + "cworkcol" + "\\b"))));
        } else {
            console.log("testevent3");
            document.cookie = "cworkcol=#0000FF";
            c3 = "#0000FF"
        }

        if (document.cookie.search(new RegExp("\\b" + "nworkcol" + "\\b")) !== -1) {
            c4 = document.cookie.substring(document.cookie.search(new RegExp("\\b" + "nworkcol" + "\\b")) + 9, document.cookie.indexOf(";", document.cookie.search(new RegExp("\\b" + "nworkcol" + "\\b"))));
        } else {
            console.log("testevent4");
            document.cookie ="nworkcol=#D3D3D3";
            c4 = "#D3D3D3"
        }

        if (document.cookie.search(new RegExp("\\b" + "rnworkcol" + "\\b")) !== -1) {
            c5 = document.cookie.substring(document.cookie.search(new RegExp("\\b" + "rnworkcol" + "\\b")) + 10, document.cookie.indexOf(";", document.cookie.search(new RegExp("\\b" + "rnworkcol" + "\\b"))));
        } else {
            console.log("testevent5");
            document.cookie = "rnworkcol=#9932cc";
            c5 = "#9932cc"
        }

        if (document.cookie.search(new RegExp("\\b" + "cnworkcol" + "\\b")) !== -1) {
            console.log("test1010gothere");
            c6 = document.cookie.substring(document.cookie.search(new RegExp("\\b" + "cnworkcol" + "\\b")) + 10, document.cookie.indexOf(";", document.cookie.search(new RegExp("\\b" + "cnworkcol" + "\\b"))));
        } else {
            console.log("testevent6");
            document.cookie = "cnworkcol=#87cefa";
            c6 = "#87cefa"
        }


        console.log("cookie", document.cookie);
        console.log("values", c1, c2, c3, c4, c5, c6);


        if (this.props.items.length > 0) {
            return (
                <div className="plan-timeline-zoom-controls">
                    <div className="plan-timeline-zoom-slider">
                        <Slider
                            min={-sliderSteps}
                            max={sliderSteps}
                            step={1}
                            showValue={false}
                            value={this.state.sliderValue}
                            disabled={this.props.items.length === 0}
                            onChange={(value: number) => {
                                const middlePoint = moment(
                                    (this.state.visibleTimeEnd.valueOf() + this.state.visibleTimeStart.valueOf()) / 2
                                );

                                let newVisibleTimeStart: moment.Moment;
                                let newVisibleTimeEnd: moment.Moment;

                                const maxMinDifference =
                                    (this.defaultTimeEnd.valueOf() - this.defaultTimeStart.valueOf()) / 2;

                                if (value === 0) {
                                    // Zoom fit zoom level
                                    newVisibleTimeStart = moment(middlePoint).add(-maxMinDifference, "milliseconds");
                                    newVisibleTimeEnd = moment(middlePoint).add(maxMinDifference, "milliseconds");
                                } else if (value < 0) {
                                    // Zoom out
                                    const stepSize = (365 * day) / sliderSteps;

                                    newVisibleTimeStart = moment(middlePoint)
                                        .add(-maxMinDifference, "milliseconds")
                                        .add(stepSize * value);
                                    newVisibleTimeEnd = moment(middlePoint)
                                        .add(maxMinDifference, "milliseconds")
                                        .add(-stepSize * value);
                                } else {
                                    // Zoom in
                                    const maxTimeStart = moment(middlePoint).add(-maxMinDifference, "milliseconds");
                                    const maxTimeEnd = moment(middlePoint).add(maxMinDifference, "milliseconds");
                                    const minTimeEnd = moment(middlePoint).add(maxZoomIn, "milliseconds");
                                    const stepSize = (maxTimeEnd.valueOf() - minTimeEnd.valueOf()) / sliderSteps;

                                    newVisibleTimeStart = moment(maxTimeStart).add(value * stepSize, "milliseconds");
                                    newVisibleTimeEnd = moment(maxTimeEnd).add(-value * stepSize, "milliseconds");
                                }

                                this.setState({
                                    sliderValue: value,
                                    visibleTimeStart: newVisibleTimeStart,
                                    visibleTimeEnd: newVisibleTimeEnd
                                });
                            }}
                        />
                    </div>
                    <div className="plan-timeline-zoom-fit-button">
                        <Button
                            text="Zoom fit"
                            disabled={this.props.items.length === 0}
                            onClick={() => {
                                const [timeStart, timeEnd] = this._getDefaultTimes(this.props.items);

                                this.defaultTimeStart = moment(timeStart);
                                this.defaultTimeEnd = moment(timeEnd);

                                this.setState({
                                    sliderValue: 0,
                                    visibleTimeStart: timeStart,
                                    visibleTimeEnd: timeEnd
                                });
                            }}
                        />
                    </div>
                </div>
            );
        }
    }

    private _renderTimeline(): JSX.Element {
        if (this.props.items.length > 0) {
            if (!this.defaultTimeStart || !this.defaultTimeEnd) {
                [this.defaultTimeStart, this.defaultTimeEnd] = this._getDefaultTimes(this.props.items);
            }
            //console.log("Groups:", this.props.groups);
            return (
                <div className="plan-timeline-container">
              
                     {/* {console.log(this.props.items.sort((a, b) => a.order - b.order))} */}

                     {/* {this.props.items = this.props.items.sort((a, b) => a.order - b.order)} */}

                    <Timeline
                        groups={this.props.groups}
                        items={this.props.items}
                        defaultTimeStart={this.defaultTimeStart}
                        defaultTimeEnd={this.defaultTimeEnd}
                        visibleTimeStart={this.state.visibleTimeStart}
                        visibleTimeEnd={this.state.visibleTimeEnd}
                        onTimeChange={this._handleTimeChange}
                        canChangeGroup={true}
                        //canMove={true}
                        stackItems={true}
                        dragSnap={day}
                        minZoom={week}
                        canResize={"both"}
                        minResizeWidth={50}
                        onItemResize={this._onItemResize}
                        onItemMove={this._onItemMove}
                        moveResizeValidator={this._validateResize}
                        selected={[this.props.selectedItemId]}
                        lineHeight={50}
                        onItemSelect={itemId => this.props.onSetSelectedItemId(itemId)}
                        onCanvasClick={() => this.props.onSetSelectedItemId(undefined)}
                        itemRenderer={({ item, itemContext, getItemProps }) =>
                            this._renderItem(item, itemContext, getItemProps)
                        }
                        groupRenderer={group => this._renderGroup(group.group)}
                    >
                        <TimelineHeaders>
                            <div onClickCapture={this._onHeaderClick}>
                                <DateHeader
                                    unit="primaryHeader"
                                    intervalRenderer={({ getIntervalProps, intervalContext, data }) => {
                                        return (
                                            <div className="date-header" {...getIntervalProps()}>
                                                {intervalContext.intervalText}
                                            </div>
                                        );
                                    }}
                                />
                                <DateHeader
                                    labelFormat={this._renderDateHeader}
                                    style={{ height: 50 }}
                                    intervalRenderer={({ getIntervalProps, intervalContext, data }) => {
                                        return (
                                            <div className="date-header" {...getIntervalProps()}>
                                                {intervalContext.intervalText}
                                            </div>
                                        );
                                    }}
                                />
                            </div>
                        </TimelineHeaders>
                    </Timeline>
                </div>
            );
        } else {
            return (
                // TODO: Add zero data images
                <ZeroData
                    imagePath=""
                    imageAltText=""
                    primaryText="This plan is empty"
                    secondaryText="Use the &quot;+&quot; button to add items to this plan"
                    actionText="Add items"
                    actionType={ZeroDataActionType.ctaButton}
                    onActionClick={this.props.onZeroDataCtaClicked}
                />
            );
        }
    }

    private _onHeaderClick = event => {
        // Disable header zoom in and out
        event.stopPropagation();
    };

    private _renderDateHeader(
        [startTime, endTime]: [moment.Moment, moment.Moment],
        unit: Unit,
        labelWidth: number,
        formatOptions: LabelFormat
    ): string {
        const small = 35;
        const medium = 100;
        const large = 150;

        let formatString: string;

        switch (unit) {
            case "year": {
                formatString = "YYYY";
                break;
            }
            case "month": {
                if (labelWidth < small) {
                    formatString = "M";
                } else if (labelWidth < medium) {
                    formatString = "MMM";
                } else if (labelWidth < large) {
                    formatString = "MMMM";
                } else {
                    formatString = "MMMM YYYY";
                }
                break;
            }
            case "day": {
                if (labelWidth < medium) {
                    formatString = "D";
                } else if (labelWidth < large) {
                    formatString = "dd D";
                } else {
                    formatString = "dddd D";
                }
                break;
            }
        }

        return startTime.format(formatString);
    }

    private _renderGroup(group: ITimelineGroup) {
        return <div className="plan-timeline-group">{group.title}</div>;
    }

    // ! highlights item if selected
    private _renderItem = (item, itemContext, getItemProps) => {
        console.log('renderitem', item);
        let borderStyle = {};
        if (itemContext.selected) {
            borderStyle = {
                borderWidth: "2px",
                borderStyle: "solid",
                borderColor: "#106ebe"
            };
        } else {
            borderStyle = {
                border: "none"
            };
        }

        const imageProps: IImageProps = {
            src: item.iconUrl,
            className: "iconClass",
            imageFit: ImageFit.contain,
            maximizeFrame: true
        };

        return (
            <div
                {...getItemProps({
                    className: "plan-timeline-item",
                    style: {
                        background: item.canMove ? "white" : "#f8f8f8",
                        fontWeight: item.canMove ? 600 : 900,
                        color: "black",
                        ...borderStyle,
                        borderRadius: "4px"
                    }
                })}
            >
                <div className="details">
                    <Image {...imageProps as any} />
                    <div className="title">{itemContext.title}</div>
                    <div className="progress-indicator">
                        <ProgressDetails
                            completed={item.itemProps.completed}
                            total={item.itemProps.total}
                            rwork={item.remaining_work}
                            cwork={item.completed_work}
                            onClick={() => {}}
                        />
                    </div>
                    <MenuButton
                        className="item-context-menu-button"
                        iconProps={{
                            iconName: "More",
                            size: IconSize.small
                        }}
                        disabled={!item.canMove}
                        subtle={true}
                        hideDropdownIcon={true}
                        onClick={() => this.setState({ contextMenuItem: item as ITimelineItem })}
                        contextualMenuProps={{
                            menuProps: {
                                id: `item-context-menu-${item.id}`,
                                items: [
                                    {
                                        id: "set-dates",
                                        text: "Set dates",
                                        iconProps: {
                                            iconName: "Calendar"
                                        },
                                        onActivate: () => this.props.onToggleSetDatesDialogHidden(false)
                                    },
                                    {
                                        id: "drill-down",
                                        text: "Drill down",
                                        iconProps: {
                                            iconName: "BacklogList"
                                        },
                                        onActivate: () => this.navigateToEpicRoadmap(item)
                                    },
                                    {
                                        id: "view-dependencies",
                                        text: "View dependencies",
                                        iconProps: {
                                            iconName: "Link"
                                        },
                                        onActivate: () => this.setState({ dependencyPanelOpen: true })
                                    },
                                    {
                                        id: "remove-item",
                                        text: "Remove item",
                                        iconProps: {
                                            iconName: "Delete"
                                        },
                                        onActivate: () =>
                                            this.props.onRemoveItem({
                                                itemIdToRemove: item.id,
                                                planId: this.props.planId
                                            })
                                    },
                                    {
                                        id: "test",
                                        text: "Test",
                                        iconProps: {
                                            iconName: ""
                                        },
                                        onActivate: () => this.Test()
                                    },
                                    // {
                                    //     id: "movedown",
                                    //     text: "Move Down",
                                    //     iconProps: {
                                    //         iconName: ""
                                    //     },
                                    //     onActivate: () => this.moveDown(item)
                                    // }
                                ],
                            }
                        }}
                    />
                </div>
            </div>
        );
    };

    private _handleTimeChange = (visibleTimeStart, visibleTimeEnd, updateScrollCanvas): void => {
        // Disable zoom using wheel
        if (
            (visibleTimeStart < this.state.visibleTimeStart.valueOf() &&
                visibleTimeEnd > this.state.visibleTimeEnd.valueOf()) ||
            (visibleTimeStart > this.state.visibleTimeStart.valueOf() &&
                visibleTimeEnd < this.state.visibleTimeEnd.valueOf())
        ) {
            // do nothing
        } else {
            this.setState({ visibleTimeStart: moment(visibleTimeStart), visibleTimeEnd: moment(visibleTimeEnd) });
        }
    };

    private _validateResize(action: string, item: ITimelineItem, time: number, resizeEdge: string) {
        if (action === "resize") {
            if (resizeEdge === "right") {
                const difference = time - item.start_time.valueOf();
                if (difference < day) {
                    time = item.start_time.valueOf() + day;
                }
            } else {
                const difference = item.end_time.valueOf() - time;
                if (difference < day) {
                    time = item.end_time.valueOf() - day;
                }
            }
        } else if (action === "move") {
            // TODO: Any validation for moving?
        }

        return time;
    }

    private _onItemResize = (itemId: number, time: number, edge: string): void => {
        const itemToUpdate = this.props.items.find(item => item.id === itemId);
        if (edge == "left") {
            this.props.onUpdateDates(itemId, moment(time), itemToUpdate.end_time);
        } else {
            // "right"
            this.props.onUpdateDates(itemId, itemToUpdate.start_time, moment(time));
        }
    };

    private _onItemMove = (itemId: number, time: number): void => {
        console.log("onitemmove", time);
        this.props.onShiftItem(itemId, moment(time));
        //const item = this.props.items.find(item => item.id === itemId);
        //console.log("Item Id: "  + itemId + ". Order: " + item.custom_order);
        //this.props.items.sort((a, b) => a.custom_order - b.custom_order)
    };

    private _getDefaultTimes(items: ITimelineItem[]): [moment.Moment, moment.Moment] {
        let startTime: moment.Moment;
        let endTime: moment.Moment;

        if (!items || items.length == 0) {
            startTime = moment().add(-1, "months");
            endTime = moment().add(1, "months");
        } else {
            for (const item of items) {
                if (item.start_time < startTime || !startTime) {
                    startTime = moment(item.start_time);
                }
                if (item.end_time > endTime || !endTime) {
                    endTime = moment(item.end_time);
                }
            }

            // Add small buffer on both sides of plan
            const buffer = (endTime.valueOf() - startTime.valueOf()) / 10;

            startTime.add(-buffer, "milliseconds");
            endTime.add(buffer, "milliseconds");

            startTime.add(-maxZoomIn, "milliseconds");
            endTime.add(maxZoomIn, "milliseconds");
        }

        this.setState({ visibleTimeStart: startTime, visibleTimeEnd: endTime });

        return [startTime, endTime];
    }

    // test, change color
    private Test() {
        document.cookie = 'cnworkcol=orange';
        console.log("cookie1", document.cookie);
    }
    // swap item order with element above
    // private moveUp(item1: ITimelineItem) {
    //     // var item2 = this.props.items.find(item => item.custom_order === item1.custom_order - 1);
    //     // item2.custom_order += 1;

    //     // item1.custom_order -= 1;

    //     // console.log("Title1:", item1.title, "Order1:", item1.custom_order);
    //     // console.log("Title2:", item2.title, "Order2:", item2.custom_order);

    //     // console.log("Item1:", item1);
    //     // console.log("Item2:", item2);

    //     // this.props.onOrderItem(item1.id, item1.custom_order);
    //     // this.props.onOrderItem(item2.id, item2.custom_order);

    // }

    // swap item order with element below
    // private moveDown(item1: ITimelineItem) {
    //     // var item2 = this.props.items.find(item => item.custom_order === item1.custom_order + 1);
    //     // item2.custom_order -= 1;

    //     // item1.custom_order += 1;

    //     // console.log("Title1:", item1.title, "Order1:", item1.custom_order);
    //     // console.log("Title2:", item2.title, "Order2:", item2.custom_order);

    //     // console.log("Item1:", item1);
    //     // console.log("Item2:", item2);

    //     // this.props.onOrderItem(item1.id, item1.custom_order);
    //     // this.props.onOrderItem(item2.id, item2.custom_order);


    //     // this.props.items.find(item => item.custom_order === item1.custom_order + 1).custom_order -= 1;

    //     // item1.custom_order += 1;
    // }

    private navigateToEpicRoadmap(item: ITimelineItem) {
        const collectionUri = VSS.getWebContext().collection.uri;
        const extensionContext = VSS.getExtensionContext();
        const projectName = item.group;
        const teamId = item.teamId;
        const backlogLevel = item.backlogLevel;
        const workItemId = item.id;

        const targerUrl = `${collectionUri}${projectName}/_backlogs/${extensionContext.publisherId}.${
            extensionContext.extensionId
        }.workitem-epic-roadmap/${teamId}/${backlogLevel}#${workItemId}`;

        VSS.getService<IHostNavigationService>(VSS.ServiceIds.Navigation).then(
            client => {
                PortfolioTelemetry.getInstance().TrackAction("NavigateToEpicRoadMap");
                client.navigate(targerUrl);
            },
            error => {
                PortfolioTelemetry.getInstance().TrackException(error);
                alert(error);
            }
        );
    }
}

function mapStateToProps(state: IPortfolioPlanningState): IPlanTimelineMappedProps {
    return {
        planId: state.planDirectoryState.selectedPlanId,
        groups: getTimelineGroups(state.epicTimelineState),
        projectNames: getProjectNames(state),
        teamNames: getTeamNames(state),
        teams: state.epicTimelineState.teams,
        items: getTimelineItems(state.epicTimelineState),
        selectedItemId: state.epicTimelineState.selectedItemId,
        planOwner: getSelectedPlanOwner(state),
        exceptionMessage: state.epicTimelineState.exceptionMessage,
        setDatesDialogHidden: state.epicTimelineState.setDatesDialogHidden,
        progressTrackingCriteria: state.epicTimelineState.progressTrackingCriteria,
        projects: getIndexedProjects(state.epicTimelineState)
    };
}

const Actions = {
    onUpdateDates: EpicTimelineActions.updateDates,
    onShiftItem: EpicTimelineActions.shiftItem,
    //onOrderItem: EpicTimelineActions.orderItem,
    onToggleSetDatesDialogHidden: EpicTimelineActions.toggleItemDetailsDialogHidden,
    onSetSelectedItemId: EpicTimelineActions.setSelectedItemId,
    onZeroDataCtaClicked: EpicTimelineActions.openAddItemPanel,
    onRemoveItem: EpicTimelineActions.removeItems
};

export const ConnectedPlanTimeline = connect(
    mapStateToProps,
    Actions
)(PlanTimeline);
