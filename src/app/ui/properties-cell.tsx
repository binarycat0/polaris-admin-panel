import {Tag, Tooltip, Typography} from 'antd'

const {Text} = Typography;

interface PropertiesCellProps {
  properties: {
    [key: string]: string;
  };
  maxVisible?: number;
}

export default function PropertiesCell({properties, maxVisible = 2}: PropertiesCellProps) {
  const propertyEntries = Object.entries(properties || {});

  if (propertyEntries.length === 0) {
    return <Text type="secondary">No Properties Presented</Text>;
  }

  return (
      <div>
        {propertyEntries.slice(0, maxVisible).map(([key, value]) => (
            <Tag key={key} style={{marginBottom: 2, fontSize: '11px'}}>
              {key}: {value}
            </Tag>
        ))}
        {propertyEntries.length > maxVisible && (
            <Tooltip title={
              <div>
                {propertyEntries.slice(maxVisible).map(([key, value]) => (
                    <div key={key}>{key}: {value}</div>
                ))}
              </div>
            }>
              <Tag style={{fontSize: '11px'}}>
                +{propertyEntries.length - maxVisible} more
              </Tag>
            </Tooltip>
        )}
      </div>
  );
}

