import React, { useState, useEffect, useContext } from 'react';

import { NerdGraphQuery, NerdletStateContext, ngql as gql } from 'nr1';
import CurrentView from '../../library/components/CurrentView';
import ChartsView from '../../library/components/ChartsView';
import EventsView from '../../library/components/EventsView';
import { EVENTS_TIMES, HISTORY_TIMES } from '../../library/constants/times';
import { calculateTimeBlock } from '../../library/utils/times';

const DetailNerdlet = () => {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [traces, setTraces] = useState([]);
  const [transports, setTransports] = useState([]);
  const [logs, setLogs] = useState([]);
  const [historyTimeIndex, setHistoryTimeIndex] = useState(0);
  const [selectedWebService, setSelectedWebService] = useState({});
  const [eventsTimes, setEventsTimes] = useState();
  const [eventsTimeIndex, setEventsTimeIndex] = useState(0);
  const { accountId, webService } = useContext(NerdletStateContext);

  useEffect(() => {
    const loadWebServices = async () => {
      const historyTime = HISTORY_TIMES[historyTimeIndex];
      const queryFilters = `WHERE instrumentation.provider = 'SAP' AND SYS_ID = '${webService.sysId}'`;
      const queryLimit = 'LIMIT MAX';
      const historyQuery = `SELECT * FROM NR_SAP_INTEGRATION_SERVICE WHERE Interface = '${webService.interface}' AND SYS_ID = '${webService.sysId}' ${queryLimit} ${historyTime.query}`;
      const transportsQuery = `SELECT count(*) FROM NR_SAP_TRANSPORT ${queryFilters} ${historyTime.query} TIMESERIES`;
      // const logsQuery = `SELECT count(*) FROM Log ${queryFilters} AND (EXTNUMBER LIKE '%${webService.messageId}%' OR MESSAGES LIKE '%${webService.messageId}%') ${historyTime.query} TIMESERIES`;
      const logsQuery = `SELECT count(*) FROM Log ${queryFilters} ${historyTime.query} TIMESERIES`;
      const tracesQuery = `SELECT count(*) FROM DistributedTraceSummary WHERE FUNCTION_NAME = '${webService.processFunction ||
        ''}' ${historyTime.query} TIMESERIES`;
      const query = gql`
        query WebServicesQuery(
          $accounts: [Int!]!
          $historyQuery: Nrql!
          $tracesQuery: Nrql!
          $transportsQuery: Nrql!
          $logsQuery: Nrql!
        ) {
          actor {
            history: nrql(accounts: $accounts, query: $historyQuery) {
              results
            }
            traces: nrql(accounts: $accounts, query: $tracesQuery) {
              results
            }
            transports: nrql(accounts: $accounts, query: $transportsQuery) {
              results
            }
            logs: nrql(accounts: $accounts, query: $logsQuery) {
              results
            }
          }
        }
      `;

      const variables = {
        accounts: [accountId],
        historyQuery,
        tracesQuery,
        transportsQuery,
        logsQuery
      };

      setLoading(true);
      const {
        loading: loadingResp,
        data: { actor: res } = {},
        error
      } = await NerdGraphQuery.query({ query, variables });
      setLoading(loadingResp);
      if (error || !res) return;

      const orderedHistory = [...res.history?.results].sort(
        (a, b) => +b.STATUS_SEQUENCE - +a.STATUS_SEQUENCE
      );
      if (orderedHistory.length) {
        setSelectedWebService(orderedHistory[0]);
        const times = calculateTimeBlock(
          orderedHistory[0],
          EVENTS_TIMES[eventsTimeIndex].medianMins
        );
        setEventsTimes(times);
      }
      setHistory(orderedHistory);
      setTraces(res.traces?.results || []);
      setTransports(res.transports?.results || []);
      setLogs(res.logs?.results || []);
    };

    if (!loading) loadWebServices();
  }, [webService, accountId, historyTimeIndex]);

  const updateEventsTimeIndex = idx => {
    const times = calculateTimeBlock(
      selectedWebService,
      EVENTS_TIMES[idx].medianMins
    );
    setEventsTimes(times);
    setEventsTimeIndex(idx);
  };

  return (
    <div className="details">
      <div className="content">
        <div className="left-column">
          <div className="current-section">
            <CurrentView webService={webService} />
          </div>
        </div>
        <div className="right-column">
          <div className="charts-section">
            <ChartsView
              history={history}
              historyTimeIndex={historyTimeIndex}
              updateHistoryTime={setHistoryTimeIndex}
              traces={traces}
              transports={transports}
              logs={logs}
              selectedWebService={selectedWebService}
              eventsTimes={eventsTimes}
            />
          </div>
          <div className="table-section">
            <EventsView
              accountId={accountId}
              webService={webService}
              selectedWebService={selectedWebService}
              eventsTimes={eventsTimes}
              eventsTimeIndex={eventsTimeIndex}
              updateEventsTimeIndex={updateEventsTimeIndex}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailNerdlet;
