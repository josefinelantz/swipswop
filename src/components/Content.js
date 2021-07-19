import React from "react";
import {Card} from "./Card";

export const Content = () => {
	return (
		<div className="content">     
      <div className="vertical-split">     
        <Card />
        <Card />
      </div>    
      <div className="vertical">
        <Card />
      </div> 
      <div className="vertical-split">
        <Card />
        <Card />
      </div>
      <div className="vertical">
        <Card />
      </div>
    </div>
	);
}