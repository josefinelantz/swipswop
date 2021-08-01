import React from "react";

export const Header = () => {
	return (

    <header>
      <h1 className="logo">Logo</h1>
      <input type="checkbox" id="nav-toggle" className="nav-toggle"></input>
      <nav>
        <ul>
          <li><a href="#">Link 1</a></li>
          <li><a href="#">Link 2</a></li>
          <li><a href="#">Link 3</a></li>
        </ul>
      </nav>
      <label for="nav-toggle" className="nav-toggle-label">
        <span></span>
      </label> 
    </header>
	);
}