import React from 'react';
import PropTypes from 'prop-types';

import { BlockText } from 'nr1';
import { COLORS } from '../../constants/colors';

const CurrentView = ({ webService }) => {
  return (
    <div
      className={`current-view ${(webService.statusGroup || '').toLowerCase()}`}
      // style={{
      //   border: `2px solid ${COLORS[webService.statusGroup]}`
      // }}
    >
      <BlockText type={BlockText.TYPE.PARAGRAPH}>
        <svg viewBox="0 0 100 70" height="30">
          <ellipse
            fill={COLORS[webService.statusGroup]}
            cx="30"
            cy="45"
            rx="30"
            ry="17"
          />
        </svg>
        <strong>{webService.statusGroup}</strong>
      </BlockText>
      <BlockText type={BlockText.TYPE.PARAGRAPH}>
        <strong>Message ID:</strong> {webService.messageId || '--'}
      </BlockText>
      <BlockText type={BlockText.TYPE.PARAGRAPH}>
        <strong>System ID:</strong> {webService.sysId || '--'}
      </BlockText>
      <BlockText type={BlockText.TYPE.PARAGRAPH}>
        <strong>Client:</strong> {webService.client || '--'}
      </BlockText>
      <BlockText type={BlockText.TYPE.PARAGRAPH}>
        <strong>Creation Date:</strong> {webService.creationDate || '--'}
      </BlockText>
      <BlockText type={BlockText.TYPE.PARAGRAPH}>
        <strong>Creation Time:</strong> {webService.creationTime || '--'}
      </BlockText>
      <BlockText type={BlockText.TYPE.PARAGRAPH}>
        <strong>Execution Date:</strong> {webService.executionDate || '--'}
      </BlockText>
      <BlockText type={BlockText.TYPE.PARAGRAPH}>
        <strong>Execution Time:</strong> {webService.executionTime || '--'}
      </BlockText>
      <BlockText type={BlockText.TYPE.PARAGRAPH}>
        <strong>Expiry Date:</strong> {webService.expiryDate || '--'}
      </BlockText>
      <BlockText type={BlockText.TYPE.PARAGRAPH}>
        <strong>Total Time:</strong> {webService.totalTime || '--'}
      </BlockText>
      <BlockText type={BlockText.TYPE.PARAGRAPH}>
        <strong>Message Size:</strong> {webService.messageSize || '--'}
      </BlockText>
      <BlockText type={BlockText.TYPE.PARAGRAPH}>
        <strong>Root Context ID:</strong> {webService.rootContextId || '--'}
      </BlockText>
      <BlockText type={BlockText.TYPE.PARAGRAPH}>
        <strong>Transaction ID:</strong> {webService.transactionId || '--'}
      </BlockText>
      <BlockText type={BlockText.TYPE.PARAGRAPH}>
        <strong>User:</strong> {webService.user || '--'}
      </BlockText>
      <BlockText type={BlockText.TYPE.PARAGRAPH}>
        <strong>Sender Interface Name:</strong>{' '}
        {webService.senderInterfaceName || '--'}
      </BlockText>
      <BlockText type={BlockText.TYPE.PARAGRAPH}>
        <strong>Receiver Interface Name:</strong>{' '}
        {webService.receiverInterfaceName || '--'}
      </BlockText>
      <BlockText type={BlockText.TYPE.PARAGRAPH}>
        <strong>Communication Type:</strong>{' '}
        {webService.communicationType || '--'}
      </BlockText>
    </div>
  );
};

CurrentView.propTypes = {
  webService: PropTypes.object
};

export default CurrentView;
