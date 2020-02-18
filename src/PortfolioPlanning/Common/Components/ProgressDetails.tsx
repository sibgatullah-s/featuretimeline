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

        console.log('progwork', rwork, cwork);

        const style = {};
        style["width"] = `${(completed * 100) / total}%`;
        const progressText = `${completed}/${total}`;

        const style1 = {};
        style1["width"] = `${(rwork * 100) / rwork}%`;
        const progressText1 = `${rwork}`;

        const style2 = {};
        style2["width"] = `${(cwork * 100) / cwork}%`;
        const progressText2 = `${cwork}`;

        return (
            <TooltipHost content={"Remaining Hours: " + rwork + " Completed Hours: " + cwork + " User Stories: " + completed + "/" + total} className="progress-indicator-tooltip">
                <div className="progress-indicator-container" onClick={onClick}>
                    <div className="progressrwork-details-parts">
                        <div className="progressrwork-completed" style={style1} />
                    </div>
                    <div className="progress-text"> {progressText1}</div>
                    <div className="progresscwork-details-parts">
                        <div className="progresscwork-completed" style={style2} />
                    </div>
                    <div className="progress-text"> {progressText2}</div>
                    <div className="progress-details-parts">
                        <div className="progress-completed" style={style} />
                    </div>
                    <div className="progress-text"> {progressText}</div>
                </div>
            </TooltipHost>
        );
    }
}
