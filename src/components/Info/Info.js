import { React, useEffect } from "react"

import "./info.css"

const Info = props => {
	return (
		<div className={props.visible}>
			<div className='close' onClick={props.hideInfo}></div>
			<div className='details'>В разработке...</div>
		</div>
	)
}

export default Info
