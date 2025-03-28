import { Empty } from 'antd';

export const NoDataComponent = () => (
  <div style={{ padding: '20px', textAlign: 'center', height: '44vh' }}>
    <Empty description="No API Requests Found" />
  </div>
);
