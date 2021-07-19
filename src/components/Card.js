import React from "react";
import {CardHeader} from "./CardHeader";
import {CardBody} from "./CardBody";


export const Card = () => {
	return (
		<div className="card bg-dark text-white">
      <CardHeader />
      <CardBody />
    </div>
	);
}