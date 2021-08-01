import React from "react";
import styled from "styled-components";

export const Card = () => {
	return (
		<div className="ui card">
  		<div className="content">
    		<div className="header">Header</div>
    			<div className="description">
      			<p>Cute dogs come in a variety of shapes and sizes.</p>
      			<p>Many people also have their own barometers.</p>
    			</div>
  			</div>
		</div>
	);
}

export const GridCard = styled(Card)`
	grid-column-start: ${props => props.colStart};
 	grid-column-end: ${props => props.colEnd};
	grid-row-start: ${props => props.rowStart};
	grid-row-end: ${props => props.rowEnd};
	background: ${props => props.backGround};
`;