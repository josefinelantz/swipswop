import React from "react";
import styled from "styled-components";
import {GridCard} from "./Card";

const GridLayout = styled.div`
  display: grid; 
	grid-template-columns: 1fr 1fr 2fr 1fr;
	grid-template-rows: 50%;
	column-gap: 0.1em;
	row-gap: 0.1em;
	height: 100vh;
`;

export const Grid = () => {

	return (
      <GridLayout className="ui grid">  
        <GridCard 
          colStart="1"
 	        colEnd="2" 
	        backGround="red"
        />
        <GridCard 
          colStart="2"
          colEnd="3"
          rowStart="1"
          rowEnd="3"
          backGround="blue"
        />
        <GridCard 
          colStart="3"
          colEnd="4"
          backGround="green"
        />
        <GridCard 
          colStart="4"
          colEnd="5"
          rowStart="1"
          rowEnd="3"
          backGround="pink"
        />
        <GridCard 
          backGround="Grey"
        />
        <GridCard 
          backGround="Cyan"
        />
      </GridLayout>
	);
}