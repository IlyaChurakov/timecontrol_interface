import React from "react"
import "./cameraEvent.css"

const CameraEvent = props => {
	return (
		<div onClick={props.showInfo} className='event' key={props.num}>
			<div className='event__item number'>{props.item.id}</div>
			<div className='event__one'>
				<div className='event__item'>ФИО:</div>
				<div className='event__item'>Зона:</div>
				<div className='event__item'>№ камеры:</div>
				<div className='event__item'>Время события:</div>
			</div>
			<div className='event__two'>
				<div className='event__item'>{props.item.fio}</div>
				<div className='event__item'>{props.item.camera_zone_name}</div>
				<div className='event__item'>{props.item.camera}</div>
				<div className='event__item'>{props.item.created_time}</div>
			</div>
		</div>
	)
}

export default CameraEvent
