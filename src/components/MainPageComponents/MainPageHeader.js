import React from "react";
import MainPageTitle from "./MainPageTitle";
import MainPageLinks from "./MainPageLinks";


export default function MainPageHeader() {
  return (
    <div className="main-page-header">      
      <MainPageTitle />
      <MainPageLinks />
    </div>
  );
}