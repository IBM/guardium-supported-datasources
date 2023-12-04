import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);


export const headerData = [
  {
    key: 'DB_VERSIONS',
    header: 'Database Version',
  },
  {
    key: 'GUARDIUM_VERSION',
    header: 'Guardium Version',
  },
  {
    key: 'OS_VERSIONS',
    header: 'OS Version',
  },
  // {
  //   key: "Network traffic",
  //   header: "Network traffic",
  // },
  // {
  //   key: 'Local traffic',
  //   header: 'Local traffic',
  // },
  // {
  //   key: 'Encrypted traffic',
  //   header: 'Encrypted traffic',
  // },
  // {
  //     key: 'Shared Memory',
  //     header: 'Shared Memory',
  // },
  // {
  //     key: 'Kerberos',
  //     header: 'Kerberos',
  // },
  // {
  //     key: 'Encrypted traffic',
  //     header: 'Encrypted traffic',
  // },
  // {
  //     key: 'Blocking',
  //     header: 'Blocking',
  // },
  // {
  //     key: 'Redaction',
  //     header: 'Redaction',
  // },
  // {
  //     key: 'UID Chain',
  //     header: 'UID Chain',
  // },
  // {
  //     key: 'Compression',
  //     header: 'Compression',
  // },
  // {
  //     key: 'Query Rewrite',
  //     header: 'Query Rewrite',
  // },
  // {
  //     key: 'Instance Discovery',
  //     header: 'Instance Discovery',
  // },
  // {
  //     key: 'Protocol',
  //     header: 'Protocol',
  // },

];
