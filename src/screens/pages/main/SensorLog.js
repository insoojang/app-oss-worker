import React from 'react'
import {
    SSensorListTitleContainerView,
    SSensorListTitleView,
    SSensorListView,
} from './MainStyle'
import { i18nt } from '../../../utils/i18n'
import { Text, ListItem } from 'react-native-elements'
import { View, ScrollView } from 'react-native'
import { fontSizeSet } from '../../../styles/size'
import Empty from '../../../components/Empty'
import { isEmpty } from 'lodash-es'

const SensorLog = (props) => {
    const { data = {} } = props

    const listRender = (data) => {
        return Object.keys(data).map((key, i) => (
            <View key={i}>
                <Text h5>{`Name : ${data[key].sensorName}`}</Text>
                <ListItem key={data[key]} bottomDivider>
                    <ListItem.Content>
                        <ListItem.Subtitle
                            key={'proximitySensor_l'}
                        >{`L_Sensor : ${
                            !isEmpty(data[key]?.data)
                                ? data[key]?.data?.proximitySensor_l
                                : '-'
                        }`}</ListItem.Subtitle>
                        <ListItem.Subtitle key={'proximitySensor_c'}>
                            {`C_Sensor : ${
                                !isEmpty(data[key]?.data)
                                    ? data[key]?.data?.proximitySensor_c
                                    : '-'
                            }`}
                        </ListItem.Subtitle>
                        <ListItem.Subtitle
                            key={'proximitySensor_r'}
                        >{`R_Sensor : ${
                            !isEmpty(data[key]?.data)
                                ? data[key]?.data?.proximitySensor_r
                                : '-'
                        }`}</ListItem.Subtitle>
                    </ListItem.Content>
                </ListItem>
            </View>
        ))
    }

    return (
        <View>
            <SSensorListTitleContainerView>
                <SSensorListTitleView>
                    {i18nt('title.sensor-log')}
                </SSensorListTitleView>
            </SSensorListTitleContainerView>
            <SSensorListView>
                <ScrollView showsVerticalScrollIndicator={false}>
                    {!isEmpty(data) ? (
                        listRender(data)
                    ) : (
                        <Empty
                            description={i18nt('alarm.no-log')}
                            {...listEmptyStyle}
                        />
                    )}
                </ScrollView>
            </SSensorListView>
        </View>
    )
}

export default SensorLog

const listEmptyStyle = {
    imgWidth: 60,
    imgHeight: 40,
    containerStyle: {
        justifyContent: 'center',
        height: 150,
        alignItems: 'center',
    },
    contentStyle: {
        paddingVertical: 10,
        fontSize: fontSizeSet.sm,
    },
}
