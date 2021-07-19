import React from "react";
import {CardText} from "./CardText";
import {CardLink} from "./CardLink";

export const CardBody = () => {
	return (
		<div className="card-body">
      <CardText />
      <CardLink />
    </div>
	);
}