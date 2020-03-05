import "./ProgressDetails.scss";
import * as React from "react";
import { TooltipHost } from "office-ui-fabric-react/lib/Tooltip";

export interface IProgressIndicator {
    total: number;
    completed: number;
    rwork: number;
    cwork: number;
}

export interface IProgressIndicatorProps extends IProgressIndicator {
    onClick: () => void;
}

export class ProgressDetails extends React.Component<IProgressIndicatorProps, {}> {
    public render() {
        const { total, completed, rwork, cwork, onClick } = this.props;

        // if (total <= 0) {
        //     return null;
        // }

        const styleworkcol = {};
        styleworkcol["width"] = `${(completed * 100) / total}%`;
        const progressText = `${completed}/${total}`;

        const stylerworkcol = {};
        stylerworkcol["width"] = `${(rwork * 100) / rwork}%`;
        const progressText1 = `${rwork}`;

        const stylecworkcol = {};
        stylecworkcol["width"] = `${(cwork * 100) / cwork}%`;
        const progressText2 = `${cwork}`;

        //$("progresscwork-completed").css("color","black");
        console.log("cookie", document.cookie);

        // initialize cookies
        //document.cookie = 'cnworkcol=';
        console.log("testingtesting32");

        const stylernworkcol = {};
        const stylecnworkcol = {};
        const stylenworkcol = {};

        // set inner html of color pickers to id of element they should affect
        

        console.log("testevent3");

        // change colors to custom if saved in cookie?
        // workcol, rworkcol, cworkcol, workcol, rnworkcol, cnworkcol
        // add to inner html
        // document.getElementById("color-picker1").innerHTML = "progress-completed";
        // !
        if (document.cookie.search(new RegExp("\\b" + "workcol" + "\\b")) !== -1) {
            console.log("test5gothere");
            styleworkcol["background"] = document.cookie.substring(document.cookie.search(new RegExp("\\b" + "workcol" + "\\b")) + 8, document.cookie.indexOf(";", document.cookie.search(new RegExp("\\b" + "workcol" + "\\b"))));
        } else {
            styleworkcol["background"] = $("#color-picker1").val();
        }
        // document.getElementById("color-picker2").innerHTML = "progressrwork-completed";
        if (document.cookie.search(new RegExp("\\b" + "rworkcol" + "\\b")) !== -1) {
            console.log("test6gothere");
            stylerworkcol["background"] = document.cookie.substring(document.cookie.search(new RegExp("\\b" + "rworkcol" + "\\b")) + 9, document.cookie.indexOf(";", document.cookie.search(new RegExp("\\b" + "rworkcol" + "\\b"))));
        } else {
            stylerworkcol["background"] = $("#color-picker2").val();
        }
        // document.getElementById("color-picker3").innerHTML = "progresscwork-completed";
        if (document.cookie.search(new RegExp("\\b" + "cworkcol" + "\\b")) !== -1) {
            console.log("test7gothere");
            stylecworkcol["background"] = document.cookie.substring(document.cookie.search(new RegExp("\\b" + "cworkcol" + "\\b")) + 9, document.cookie.indexOf(";", document.cookie.search(new RegExp("\\b" + "cworkcol" + "\\b"))));
        } else {
            stylecworkcol["background"] = $("#color-picker3").val();
        }
        // document.getElementById("color-picker4").innerHTML = "progress-details-parts";
        if (document.cookie.search(new RegExp("\\b" + "nworkcol" + "\\b")) !== -1) {
            console.log("test8gothere");
            stylenworkcol["background"] = document.cookie.substring(document.cookie.search(new RegExp("\\b" + "nworkcol" + "\\b")) + 9, document.cookie.indexOf(";", document.cookie.search(new RegExp("\\b" + "nworkcol" + "\\b"))));
        } else {
            stylenworkcol["background"] = $("#color-picker4").val();
        }
        // document.getElementById("color-picker5").innerHTML = "progressrwork-details-parts";!
        if (document.cookie.search(new RegExp("\\b" + "rnworkcol" + "\\b")) !== -1) {
            console.log("test9gothere");
            stylernworkcol["background"] = document.cookie.substring(document.cookie.search(new RegExp("\\b" + "rnworkcol" + "\\b")) + 10, document.cookie.indexOf(";", document.cookie.search(new RegExp("\\b" + "rnworkcol" + "\\b"))));
        } else {
            stylernworkcol["background"] = $("#color-picker5").val();
        }
        // document.getElementById("color-picker6").innerHTML = "progresscwork-details-parts";!
        if (document.cookie.search(new RegExp("\\b" + "cnworkcol" + "\\b")) !== -1) {
            console.log("test10gothere");
            stylecnworkcol["background"] = document.cookie.substring(document.cookie.search(new RegExp("\\b" + "cnworkcol" + "\\b")) + 10, document.cookie.indexOf(";", document.cookie.search(new RegExp("\\b" + "cnworkcol" + "\\b"))));
        } else {
            stylecnworkcol["background"] = $("#color-picker6").val();
        }
        
        console.log("test10", stylecnworkcol);
        console.log(styleworkcol, "r", stylerworkcol, "c", stylecworkcol, "n", stylenworkcol, "rn", stylernworkcol, "cn", stylecnworkcol);


        return (
            <TooltipHost content={"Remaining Hours: " + rwork + " Completed Hours: " + cwork + " User Stories: " + completed + "/" + total} className="progress-indicator-tooltip">
                <div className="progress-indicator-container" onClick={onClick}>
                    <div className="progressrwork-details-parts" style={stylernworkcol}>
                        <div className="progressrwork-completed" style={stylerworkcol} />
                    </div>
                    <div className="progress-text"> {progressText1}</div>
                    <div className="progresscwork-details-parts" style={stylecnworkcol}>
                        <div className="progresscwork-completed" style={stylecworkcol} />
                    </div>
                    <div className="progress-text"> {progressText2}</div>
                    <div className="progress-details-parts" style={stylenworkcol}>
                        <div className="progress-completed" style={styleworkcol} />
                    </div>
                    <div className="progress-text"> {progressText}</div>
                </div>
            </TooltipHost>
        );
    }
}
