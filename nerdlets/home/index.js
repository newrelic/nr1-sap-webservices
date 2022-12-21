import React, { useState, useEffect, useContext } from 'react';

import {
  AutoSizer,
  EmptyState,
  navigation,
  NerdGraphQuery,
  ngql as gql,
  usePlatformState,
  NerdletStateContext
} from 'nr1';
import FilterBar from '../../library/components/FilterBar';
import WebServicesList from '../../library/components/WebServicesList';
import GraphView from '../../library/components/GraphView';

const HomeNerdlet = () => {
  const { entityGuid } = useContext(NerdletStateContext);
  const [loading, setLoading] = useState(false);
  const [webServices, setWebServices] = useState([]);
  const [filters, setFilters] = useState({});
  const [wsInterface, setWsInterface] = useState();
  const [wsInterfaces, setWsInterfaces] = useState([]);
  const [sysId, setSysId] = useState();
  const [sysIds, setSysIds] = useState([]);
  const [messageStatuses, setMessageStatuses] = useState([]);
  const [{ accountId, timeRange }] = usePlatformState();

  useEffect(() => {
    if (loading || accountId === 'cross-account') return;
    const query = gql`
      query WebServicesQuery($accounts: [Int!]!, $nrqlQuery: Nrql!) {
        actor {
          nrql(accounts: $accounts, query: $nrqlQuery) {
            results
          }
        }
      }
    `;
    const variables = { accounts: [accountId] };
    const queryTime = timeRange.duration
      ? `SINCE ${Date.now() - timeRange.duration}`
      : `SINCE ${timeRange.begin_time} UNTIL ${timeRange.end_time}`;

    const maxQueryTime = 'SINCE 30 days ago';

    const loadEntityProps = async () => {
      const propsToLoad =
        'latest(Interface) AS wsInterface, latest(SYS_ID) AS sId';
      variables.nrqlQuery = `SELECT ${propsToLoad} FROM NR_SAP_INTEGRATION_SERVICE WHERE entity.guid = '${entityGuid}' ${maxQueryTime}`;
      setLoading(true);
      const {
        data: {
          actor: {
            nrql: {
              results: [{ wsInterface, sId }]
            }
          }
        },
        error
      } = await NerdGraphQuery.query({ query, variables });
      if (error || !wsInterface || !sId) {
        setLoading(false);
        return;
      }
      setWsInterface(wsInterface);
      setSysId(sId);

      loadFilterLists(wsInterface, sId);
    };

    const loadFilterLists = async (wsInterface, sId) => {
      const filterLists =
        'uniques(Interface) AS uniqInterfaces, uniques(Message_Status) AS uniqMessageStatuses, uniques(SYS_ID) AS uniqSysIds';
      variables.nrqlQuery = `SELECT ${filterLists} FROM NR_SAP_INTEGRATION_SERVICE ${queryTime} LIMIT MAX`;
      setLoading(true);
      const {
        data: {
          actor: {
            nrql: {
              results: [{ uniqInterfaces, uniqMessageStatuses, uniqSysIds }]
            }
          }
        },
        error
      } = await NerdGraphQuery.query({ query, variables });
      if (error || !uniqInterfaces || !uniqMessageStatuses) {
        setLoading(false);
        return;
      }
      setWsInterfaces(uniqInterfaces);
      setSysIds(uniqSysIds);
      setMessageStatuses(uniqMessageStatuses);

      loadWebServices(wsInterface, sId);
    };

    const loadWebServices = async (wsInterface, sId) => {
      const queryFilter = `WHERE Interface = '${wsInterface}' AND SYS_ID = '${sId}'`;
      const fields = [
        'Interface',
        'Message_ID',
        'Message_Status',
        'Processing_Status',
        'Error_ID',
        'Error_Information',
        'STATUS_GROUP',
        'SYS_ID',
        'Client',

        'Adapter_Type',
        'Communication_Type',
        'Creation_Date',
        'Creation_Time',
        'Execution_Date',
        'Execution_Time',
        'Expiry_Date',
        'Message_Size',
        'Root_Context_ID',
        'Receiver_Interface_Name',
        'Sender_Interface_Name',
        'TOTAL_TIME',
        'Transaction_ID',
        'User'
      ];
      const queryFields = `${fields.reduce(
        (acc, cur, index) =>
          `${acc}latest(${cur}) AS ${cur
            .toLowerCase()
            .replace(/(_[a-z])/g, m => m.toUpperCase().replace('_', ''))}${index < fields.length - 1 ? ', ' : ' '}`, // eslint-disable-line prettier/prettier
        ''
      )}`;

      variables.nrqlQuery = `SELECT ${queryFields} FROM NR_SAP_INTEGRATION_SERVICE ${queryFilter} FACET Message_ID as messageId ${queryTime} LIMIT MAX`;
      setLoading(true);
      const { loading: loadingResp, data, error } = await NerdGraphQuery.query({
        query,
        variables
      });
      setLoading(loadingResp);
      if (error || !data) return;

      console.log('### SK >>> variables.nrqlQuery: ', variables.nrqlQuery);
      console.log('### SK >>> messageId = 6045BD8FB9BB1EED9FF225C89FFBA81F: ', data.actor?.nrql?.results.find(e => e.messageId = '6045BD8FB9BB1EED9FF225C89FFBA81F') );
      setWebServices(data.actor?.nrql?.results || []);
    };

    if (!wsInterface || !sysId) {
      loadEntityProps();
    } else {
      loadFilterLists(wsInterface, sysId);
    }
  }, [accountId, timeRange, wsInterface, sysId]);

  const filteredWebServices = Object.keys(filters).reduce((acc, cur) => {
    if (filters[cur] !== '')
      acc = acc.filter(elm => new RegExp(filters[cur], 'i').test(elm[cur]));
    return acc;
  }, webServices);

  const updateFilters = (name, value) =>
    setFilters({ ...filters, [name]: value });

  const selectHandler = webService =>
    navigation.openStackedNerdlet({
      id: 'detail',
      urlState: { accountId, webService, timestamp: webService.timestamp }
    });

  if (accountId === 'cross-account')
    return (
      <EmptyState
        fullHeight
        fullWidth
        type={EmptyState.TYPE.ERROR}
        iconType={EmptyState.ICON_TYPE.INTERFACE__STATE__CRITICAL}
        title="No account selected!"
        description="Please choose an account to get started."
      />
    );

  return (
    <div className="container">
      <div className="main-content">
        <div className="viz-section">
          <AutoSizer>
            {({ width, height }) => (
              <GraphView
                height={height}
                width={width}
                webServices={filteredWebServices}
              />
            )}
          </AutoSizer>
          <FilterBar
            wsInterface={wsInterface}
            wsInterfaces={wsInterfaces}
            updateWsInterface={setWsInterface}
            sysId={sysId}
            sysIds={sysIds}
            updateSysId={setSysId}
            messageStatuses={messageStatuses}
            updateFilters={updateFilters}
          />
        </div>
        <div className="table-section">
          {filteredWebServices && filteredWebServices.length ? (
            <WebServicesList
              webServices={filteredWebServices}
              selectHandler={selectHandler}
            />
          ) : (
            <EmptyState
              title="No Web Services to display"
              description="Try changing the filters or the time period."
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeNerdlet;
