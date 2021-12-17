import React, { useEffect, useState } from 'react'
import { View, TouchableOpacity } from 'react-native'
import { ListItem, Text } from 'react-native-elements'
import {
    SSensorListTitleContainerView,
    SSensorListTitleView,
    SSensorListView,
} from './MainStyle'
import { i18nt } from '../../../utils/i18n'
import Empty from '../../../components/Empty'
import { fontSizeSet } from '../../../styles/size'
import { colorSet } from '../../../styles/colors'
import StateBar from '../../../components/StateBar'
import { sensorStatusTitle, typeOfFastened } from '../../../utils/common'
import { times } from '../../../utils/format'
import { sensorTitleParser } from '../../../utils/parser'
import { isEmpty } from 'lodash-es'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { useSelector, useDispatch } from 'react-redux'
import { setScanListAction } from '../../../redux/reducers'

const SensorList = ({ list = [], deleteMode = false, setDeleteList, test }) => {
    const [listOpen, setListOpen] = useState(false)
    const [listState, setListState] = useState([])
    const { storeScanList } = useSelector((state) => state)
    const dispatch = useDispatch()

    const setListFunction = (value) => {
        setListState(value)
    }
    const updateList = (target) => {
        const newListState = listState.reduce((acc, datum) => {
            if (datum?.name === target?.name) {
                acc.push(Object.assign(datum, { check: true }))
            } else {
                acc.push(Object.assign(datum, { check: false }))
            }
            return acc
        }, [])
        setListFunction(newListState)
    }
    useEffect(() => {
        setListFunction(list)
        console.log('snesorListTest@@@@@@@@@@', list)
    }, [list])

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
    const listStyle = {
        title: {
            fontSize: fontSizeSet.base,
        },
        subTitle: {
            fontSize: fontSizeSet.sm,
            color: colorSet.disableText,
        },
    }

    const renderItem = ({ item, index }) => {
        return (
            <ListItem
                topDivider
                key={index}
                onPress={() => {
                    updateList(item)
                }}
                containerStyle={{
                    backgroundColor: item.check ? '#f9f9f9' : '#fff',
                    borderColor:
                        index === 0 ? 'transparent' : colorSet.borderColor,
                    paddingHorizontal: 0,
                }}
            >
                <StateBar
                    title={sensorStatusTitle(item.status)}
                    innerStyle={typeOfFastened(item.status)}
                />
                <ListItem.Content>
                    <ListItem.Title style={listStyle.title}>
                        {item?.sensorName}
                    </ListItem.Title>
                    <ListItem.Subtitle style={listStyle.subTitle}>
                        {times.getDefaultFormat()}
                    </ListItem.Subtitle>
                </ListItem.Content>
                {item?.status === 'error' || deleteMode ? (
                    <TouchableOpacity
                        onPress={() => {
                            if (deleteMode) {
                                const filterItem = storeScanList.filter(
                                    (list) => list.uuid !== item.uuid,
                                )
                                dispatch(setScanListAction(filterItem))
                                setDeleteList(item)
                            } else {
                                const filterItem = storeScanList.filter(
                                    (list) => list.uuid !== item.uuid,
                                )
                                dispatch(setScanListAction(filterItem))
                            }
                        }}
                        style={{ marginHorizontal: 15 }}
                        hitSlop={{
                            top: 10,
                            right: 15,
                            bottom: 10,
                            left: 15,
                        }}
                    >
                        <Icon
                            name="minus-circle"
                            color={'red'}
                            size={30}
                            style={{ marginHorizontal: 5 }}
                        />
                    </TouchableOpacity>
                ) : null}
            </ListItem>
        )
    }

    return (
        <View>
            <SSensorListTitleContainerView>
                <SSensorListTitleView>
                    {i18nt('title.sensor-list')}
                </SSensorListTitleView>
                <Text>{listState.length}</Text>
            </SSensorListTitleContainerView>
            <SSensorListView>
                {isEmpty(listState) || listState.length === 0 ? (
                    <Empty
                        description={i18nt('alarm.no-sensor')}
                        {...listEmptyStyle}
                    />
                ) : (
                    <>
                        {listState.map((item, index) => {
                            if (listOpen) {
                                return renderItem({ item, index })
                            } else {
                                return index < 3
                                    ? renderItem({ item, index })
                                    : null
                            }
                        })}
                        {listState.length > 3 ? (
                            listOpen ? (
                                <TouchableOpacity
                                    style={{
                                        width: '100%',
                                        backgroundColor: 'white',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                    onPress={() => setListOpen(false)}
                                >
                                    <Text
                                        style={{
                                            fontSize: fontSizeSet.base,
                                            paddingVertical: 15,
                                        }}
                                    >
                                        {i18nt('action.view-fold')}
                                    </Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    style={{
                                        width: '100%',
                                        backgroundColor: 'white',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                    onPress={() => {
                                        setListOpen(true)
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: fontSizeSet.base,
                                            paddingVertical: 15,
                                        }}
                                    >
                                        {i18nt('action.view-more')}
                                    </Text>
                                </TouchableOpacity>
                            )
                        ) : null}
                    </>
                )}
            </SSensorListView>
        </View>
    )
}

export default SensorList
