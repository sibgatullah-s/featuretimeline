import * as React from "react";
import "./PlanSettingsPanel.scss";
import { Panel } from "azure-devops-ui/Panel";
import { ComboBox } from "office-ui-fabric-react/lib/ComboBox";
import { ProgressTrackingCriteria, ITimelineItem} from "../../Contracts";
// import { EpicTimelineActions } from "../../Redux/Actions/EpicTimelineActions";

import {c1} from "./PlanTimeline";
import {c2} from "./PlanTimeline";
import {c3} from "./PlanTimeline";
import {c4} from "./PlanTimeline";
import {c5} from "./PlanTimeline";
import {c6} from "./PlanTimeline";

const colorDict = {"workcol": "progress-completed", "rworkcol": "progressrwork-completed", "cworkcol": "progresscwork-completed", "nworkcol": "progress-details-parts", "rnworkcol": "progressrwork-details-parts", "cnworkcol": "progresscwork-details-parts"};
//var test = false;

export interface IPlanSettingsProps {
    progressTrackingCriteria: ProgressTrackingCriteria;
    onProgressTrackingCriteriaChanged: (criteria: ProgressTrackingCriteria) => void;
    onClosePlanSettingsPanel: () => void;
    items: ITimelineItem[];
    onColorChanged: (criteria: ProgressTrackingCriteria) => void;
}

// option settings header for plan-timeline
export const PlanSettingsPanel = (props: IPlanSettingsProps) => {
    console.log("testevent1", props.items);
    // console.log("testevent1", test);
    const completedCountKey = "completedCount";
    const effortKey = "effort";

    var selectedProgressCriteriaKey =
        props.progressTrackingCriteria === ProgressTrackingCriteria.CompletedCount ? completedCountKey : effortKey;
    console.log("testevent1", selectedProgressCriteriaKey);
    // undoing change caused by trying to use toggle progress criteria to refresh (render) new color-picker color
    // if (test == true) {
    //     test = false;
    //     if (selectedProgressCriteriaKey == completedCountKey) {
    //         props.onColorChanged(ProgressTrackingCriteria.Effort);
    //     } else {    
    //         props.onColorChanged(ProgressTrackingCriteria.CompletedCount);
    //     }
        
    // }
    // console.log("testevent1", test);
    console.log("testevent1", selectedProgressCriteriaKey);
    return (
        <Panel onDismiss={props.onClosePlanSettingsPanel} titleProps={{ text: "Settings" }}>
            <div className="settings-container">
                <div className="progress-options settings-item">
                    <div className="progress-options-label">Track Progress Using: </div>
                    <ComboBox
                        className="progress-options-dropdown"
                        selectedKey={selectedProgressCriteriaKey}
                        allowFreeform={false}
                        autoComplete="off"
                        options={[
                            {
                                key: completedCountKey,
                                text: ProgressTrackingCriteria.CompletedCount
                            },
                            {
                                key: effortKey,
                                text: ProgressTrackingCriteria.Effort
                            }
                        ]}
                        onChanged={(item: { key: string; text: string }) => {
                            switch (item.key) {
                                case completedCountKey:
                                    props.onProgressTrackingCriteriaChanged(ProgressTrackingCriteria.CompletedCount);
                                    break;
                                case effortKey:
                                    props.onProgressTrackingCriteriaChanged(ProgressTrackingCriteria.Effort);
                                    break;
                            }
                        }}
                    />
                </div>
                <div className="dropdown-content">
                    <a href="#" id="workcol">Color 1
                        <span className="tooltiptext">Color for Completed User Stories</span>
                        <div className="inner-picker1">
                            <input type="color" id="color-picker11" value={c1} onInput={onColorChange(props)}/>
                        </div>
                    </a>
                    <a href="#" id="rworkcol">Color 2
                        <span className="tooltiptext">Color for Remaining Hours</span>
                        <div className="inner-picker2">
                            <input type="color" id="color-picker22" value={c2} onInput={onColorChange(props)}/>
                        </div>   
                    </a>
                    <a href="#" id="cworkcol">Color 3
                        <span className="tooltiptext">Color for Completed Hours</span>
                        <div className="inner-picker3">
                            <input type="color" id="color-picker33" value={c3} onInput={onColorChange(props)}/>
                        </div> 
                    </a>
                    <a href="#" id="nworkcol">Color 4
                        <span className="tooltiptext">Color for Uncompleted User Stories</span>
                        <div className="inner-picker4">
                            <input type="color" id="color-picker44" value={c4} onInput={onColorChange(props)}/>
                        </div>    
                    </a>
                    <a href="#" id="rnworkcol">Color 5
                        <span className="tooltiptext">Color for 0 Remaining Hours</span>
                        <div className="inner-picker5">
                            <input type="color" id="color-picker55" value={c5} onInput={onColorChange(props)}/>
                        </div> 
                    </a>
                    <a href="#" id="cnworkcol">Color 6
                        <span className="tooltiptext">Color for 0 Completed Hours</span>
                        <div className="inner-picker6">
                            <input type="color" id="color-picker66" value={c6} onInput={onColorChange(props)}/>
                        </div> 
                    </a>
                </div>
            </div>
        </Panel>
    );
};

export const onColorChange = (props: IPlanSettingsProps) => event => {
    
    console.log("testevent1", props);
    console.log("testevent1.1", $(event.target.id).val(), event.target); // event.target.(id(color picker), value(value of color))
    // update cookie to new color
    document.cookie = event.target.parentElement.parentElement.id + "=" + String($("#" + event.target.id).val());
    console.log("testevent1", document.cookie);
    //console.log("testevent", $("#" + event.target.id).val());
    //console.log("testevent " + event.target.parentElement.parentElement.id + "=" + String($(event.target.id).val()));
    //var elem = event.target.parentElement.parentElement.id;
    // update all css values with new color
    //var test = document.getElementsByClassName("progresscwork-details-parts");
    // console.log("dict", colorDict[event.target.parentElement.parentElement.id]);

    // update all elements color with classname
    var x = document.getElementsByClassName(colorDict[event.target.parentElement.parentElement.id]);
    var i;
    for (i = 0; i < x.length; i++) {
        console.log("testevent1.2", x[i]);
        // if(($("#" + event.target.id).val() == "#0000ff") || ($("#" + event.target.id).val() == "#87cefa")){
        //     console.log("testeventwhy");
        // }
        x[i]["style"].background = $("#" + event.target.id).val();
    };

    // update value of color-picker
    console.log("testevent1.3", document.getElementById(event.target.id));
    console.log("testevent1.4", document.getElementById(event.target.id)["defaultValue"] = $("#" + event.target.id).val());
    // console.log("testevent2.01", event.target);
    // console.log("testevent2.1", document.getElementById(event.target.id)["value"] = $("#" + event.target.id).val(), document.getElementById(event.target.id)["defaultValue"] = $("#" + event.target.id).val());
    // console.log("testeventpickervalue",  document.getElementById(event.target.id)["value"]);

    // !!terribly ineffecient it hurts. calling toggle progress criteria twice to refresh/render
    
    try {
        const completedCountKey = "completedCount";
        const effortKey = "effort";

        const selectedProgressCriteriaKey =
            props.progressTrackingCriteria === ProgressTrackingCriteria.CompletedCount ? completedCountKey : effortKey;
        if (selectedProgressCriteriaKey == completedCountKey) {
            props.onColorChanged(ProgressTrackingCriteria.Effort);
            props.onColorChanged(ProgressTrackingCriteria.CompletedCount);
        } else {    
            props.onColorChanged(ProgressTrackingCriteria.CompletedCount);
            props.onColorChanged(ProgressTrackingCriteria.Effort);
        }

        //console.log("testingtesting", this.props.onSetSelectedItemId(this.props.items[0].id));
        // console.log("testevent1", EpicTimelineActions.shiftItem(props.items[0].id, moment(Date.parse(props.items[0].start_time["_i"]))));
        // ! very ineffecient, will this always work?
        // unhighlight first item which was highlighted previously
        
    } finally {

    }
    
};

