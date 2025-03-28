import { Button, Divider, Flex, message, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { NoDataComponent } from './NoData';

const columns: ColumnsType<any> = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
  },
  {
    title: 'Created At',
    dataIndex: 'created_at',
    key: 'created_at',
    render(value, record, index) {
      return moment(value).format('DD-MM-YY HH:mm');
    },
  },
  {
    title: 'Method',
    dataIndex: 'method',
    key: 'method',
  },
  {
    title: 'Action',
    dataIndex: 'address',
    key: 'address',
  },
];

const RequestList: React.FC = () => {
  const [savedData, setSavedData] = useState([]);
  console.log('savedData :>> ', savedData);

  const fetchData = async () => {
    const data = await window.electronAPI.fetchSavedData();
    setSavedData(data as any);
  };

  useEffect(() => {
    fetchData();

    const intervalId = setInterval(fetchData, 30000);

    window.electronAPI.onSyncUpdate((data) => {
      setSavedData(savedData.map(({ id }: any) => id != data.id) as any);
      fetchData();
    });

    return () => clearInterval(intervalId);
  }, []);

  const addRequest = async () => {
    const url = 'https://dummyjson.com/test';

    await window.electronAPI.sendData({ url, method: 'GET' });

    await fetchData();

    message.success('Success');
  };

  return (
    <div style={styles.container}>
      <Flex wrap gap="small" style={styles.header}>
        <Button type="primary" onClick={addRequest} style={styles.button}>
          Add another API to Database
        </Button>
        <Divider orientation="left">Pending List</Divider>
      </Flex>
      <div style={styles.tableWrapper}>
        <Table
          style={styles.table}
          dataSource={savedData}
          columns={columns}
          pagination={false}
          scroll={{ y: 400 }}
          locale={{ emptyText: <NoDataComponent /> }}
        />
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '16px',
    maxWidth: '900px',
    margin: '0 auto',
    background: '#fff',
    borderRadius: '8px',
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
  },
  header: {
    marginBottom: '12px',
    justifyContent: 'space-between',
  },
  button: {
    marginBottom: '8px',
  },
  table: {
    height: '100%',
  },
  tableWrapper: {
    height: '400px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    overflowY: 'scroll',
  },
};

export default RequestList;
