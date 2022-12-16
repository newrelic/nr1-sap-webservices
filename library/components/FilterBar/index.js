import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { Dropdown, DropdownItem, Switch, TextField } from 'nr1';

const FilterBar = ({
  wsInterface,
  wsInterfaces,
  updateWsInterface,
  sysId,
  sysIds,
  updateSysId,
  messageStatuses,
  updateFilters
}) => {
  const [values, setValues] = useState({
    wsInterface: '',
    sysId: '',
    client: '',
    senderInterfaceName: '',
    receiverInterfaceName: '',
    communicationType: '',
    adapterType: '',
    messageStatus: ''
  });
  const [allFilters, setAllFilters] = useState(false);

  const changeHandler = (evt, name) => {
    const {
      target: { value }
    } = evt;
    setValues({ ...values, [name]: value });
    updateFilters(name, value);
  };

  const changeMessageStatus = st => {
    const messageStatus = st === '(clear)' ? '' : st;
    setValues({ ...values, messageStatus });
    updateFilters('messageStatus', messageStatus);
  };

  const messageStatusList = ['(clear)', ...messageStatuses];

  const showAllFilters = () => setAllFilters(!allFilters);

  return (
    <div className="filters">
      <Dropdown
        label="Filter by Interface"
        title={values.wsInterface || wsInterface}
        items={wsInterfaces}
      >
        {({ item, index }) => (
          <DropdownItem key={index} onClick={() => updateWsInterface(item)}>
            {item}
          </DropdownItem>
        )}
      </Dropdown>
      <Dropdown
        label="Filter by System"
        title={values.sysId || sysId}
        items={sysIds}
      >
        {({ item, index }) => (
          <DropdownItem key={index} onClick={() => updateSysId(item)}>
            {item}
          </DropdownItem>
        )}
      </Dropdown>
      <TextField
        label="Filter by Client"
        placeholder=""
        value={values.client}
        onChange={evt => changeHandler(evt, 'client')}
      />
      <TextField
        label="Filter by Sender Interface Name"
        placeholder=""
        value={values.senderInterfaceName}
        onChange={evt => changeHandler(evt, 'senderInterfaceName')}
      />
      <TextField
        label="Filter by Receiver Interface Name"
        placeholder=""
        value={values.receiverInterfaceName}
        onChange={evt => changeHandler(evt, 'receiverInterfaceName')}
      />

      <Dropdown
        label="Filter by Message Status"
        title={values.messageStatus}
        items={messageStatusList}
      >
        {({ item, index }) => (
          <DropdownItem key={index} onClick={() => changeMessageStatus(item)}>
            {item}
          </DropdownItem>
        )}
      </Dropdown>

      <Switch
        checked={allFilters}
        label="Additional filters"
        info="show additional filter options"
        onChange={showAllFilters}
      />

      {allFilters ? (
        <>
          <TextField
            label="Filter by Adapter Tytpe"
            placeholder=""
            value={values.adapterType}
            onChange={evt => changeHandler(evt, 'adapterType')}
          />
          <TextField
            label="Filter by Communication Type"
            placeholder=""
            value={values.communicationType}
            onChange={evt => changeHandler(evt, 'communicationType')}
          />
        </>
      ) : null}
    </div>
  );
};

FilterBar.propTypes = {
  wsInterface: PropTypes.string,
  wsInterfaces: PropTypes.array,
  updateWsInterface: PropTypes.func,
  sysId: PropTypes.string,
  sysIds: PropTypes.array,
  updateSysId: PropTypes.func,
  messageStatuses: PropTypes.array,
  updateFilters: PropTypes.func
};

export default FilterBar;
