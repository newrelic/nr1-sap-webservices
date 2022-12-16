import React from 'react';
import PropTypes from 'prop-types';

import {
  Table,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TableRowCell
} from 'nr1';

const WebServicesList = ({ webServices, selectHandler }) => {
  return (
    <div className="table-view">
      <Table
        selectionType={Table.SELECTION_TYPE.SINGLE}
        items={webServices}
        onSelect={(_, { item }) => selectHandler(item)}
        multivalue
      >
        <TableHeader>
          <TableHeaderCell value={({ item }) => item.interface}>
            interface
          </TableHeaderCell>
          <TableHeaderCell value={({ item }) => item.messageId}>
            Message ID
          </TableHeaderCell>
          <TableHeaderCell value={({ item }) => item.messageStatus}>
            Message Status
          </TableHeaderCell>
          <TableHeaderCell value={({ item }) => item.processingStatus}>
            Processing Status
          </TableHeaderCell>
          <TableHeaderCell value={({ item }) => item.statusGroup}>
            Status Group
          </TableHeaderCell>
          <TableHeaderCell value={({ item }) => item.sysId}>
            System ID
          </TableHeaderCell>
          <TableHeaderCell value={({ item }) => item.client}>
            Client
          </TableHeaderCell>
        </TableHeader>
        {({ item }) => (
          <TableRow>
            <TableRowCell>{item.interface}</TableRowCell>
            <TableRowCell>{item.messageId}</TableRowCell>
            <TableRowCell>{item.messageStatus}</TableRowCell>
            <TableRowCell>{item.processingStatus}</TableRowCell>
            <TableRowCell>{item.statusGroup}</TableRowCell>
            <TableRowCell>{item.sysId}</TableRowCell>
            <TableRowCell>{item.client}</TableRowCell>
          </TableRow>
        )}
      </Table>
    </div>
  );
};

WebServicesList.propTypes = {
  webServices: PropTypes.array,
  selectHandler: PropTypes.func
};

export default WebServicesList;
