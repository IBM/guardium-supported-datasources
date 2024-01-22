import React from 'react';
import '../styles/styles.css'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

class ExpandingTableRow extends React.Component {

  state = { expanded: false }
  toggleExpander = (e) => {

    if (e.target.type === 'checkbox') return;

    if (!this.state.expanded) {
      this.setState(
        { expanded: true }
      );
    } else {
      this.setState({ expanded: false }); 
    }
    }
  

  render(){
    const { user } = this.props;
    const { opened } = this.props;
    
    
    
    

    return [
      <tr key="main" onClick={this.toggleExpander} class="tablerow">
        <td class="datacell"><KeyboardArrowDownIcon id={"rotate"+this.state.expanded}/></td>
        
        <td class="datacell">{user.DB_VERSIONS }</td>
        <td class="datacell">{user.GUARDIUM_VERSION}</td>
        <td class="datacell">
            <li>
            {user.OS_VERSIONS.map((osv) => (
            
            <ul class="oslist">
              {osv}

            </ul>
              ))}
            
              
            </li>
        </td>
  
      </tr>,
      this.state.expanded && (
 
        <tr class="expandable" key="tr-expander">
          <td className="uk-background-muted" colSpan={6}>
            <div ref="expanderBody" className="inner uk-grid">
              
              <div className="uk-width-1-2" id="specifics-container">

              <table id="specifics">
  <tr>
    <td id="heading" class="top"> Network Traffic:</td>
    <td class="top" > {user["Network traffic"] == ""  ?  "-" : user["Network traffic"]} {} </td>
    
    <td id="heading" class="top" >Redaction:</td>
    <td class="top">{user["Redaction"] == ""  ?  "-" : user["Redaction"]} </td>
  
  </tr>
  <tr>
    <td id="heading">Local Traffic:</td>
    <td>{user["Local traffic"] == ""  ?  "-" :  user["Local traffic"]} </td>
    
    <td id="heading">UID Chain: </td>
    <td>{user["UID Chain"] == ""  ?  "-" :  user["UID Chain"]}   </td>
  </tr>
  <tr>
    <td id="heading">Encrypted Traffic: </td>
    <td>{user["Encrypted traffic"] == ""  ?  "-" : user["Encrypted traffic"]} </td>
    
    <td id="heading">Compression: </td>
    <td>{user["Compression"] == ""  ?  "-" : user["Compression"]  } </td>
  </tr>
  <tr>
    <td id="heading"> Shared Memory: </td>
    <td>{user["Shared Memory"] == ""  ?  "-" :  user["Shared Memory"] }</td>
    
    <td id="heading"> Query Rewrite: </td>
    <td>{user["Query Rewrite"] == ""  ?  "-" : user["Query Rewrite"]}    </td>

  </tr>
  <tr>
    <td id="heading"> Kerberos: </td>
    <td>{user["Kerberos"]  == ""  ?  "-" : user["Kerberos"]} </td>
    
    <td id="heading"> Instance Discovery: </td>
    <td> {user["Instance Discovery"] == ""  ?  "-" : user["Instance Discovery"]}  </td>

  </tr>

  <tr>
    <td id="heading" class="bottom"> Blocking: </td>
    <td class="bottom"> {user["Blocking"] == ""  ?  "-" : user["Blocking"]} </td>
    
    <td id="heading" class="bottom"> Protocol: </td>
    <td class="bottom"> {user["Protocol"] == ""  ?  "-" : user["Protocol"] } </td>

  </tr>

  </table>
  </div>
  </div>
  </td>
  </tr>
          
 
      )

    ]


  }
}

export default ExpandingTableRow;