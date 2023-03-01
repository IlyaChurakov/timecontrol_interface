import { React, useState, useEffect } from "react"
import { URL } from "../../variables"

const Dossier = () => {
	const [data, setData] = useState(null)

	const getData = async () => {
		await fetch(`http://${URL}/dossiers`)
			.then(res => {
				return res.json()
			})
			.then(resbody => {
				setData(JSON.parse(resbody))
				console.log(JSON.parse(resbody))
			})
			.catch(err => console.log(err))
	}

	useEffect(() => {
		getData()
	}, [])

	return <div>{data ? data.results.map(item => {}) : null}</div>
}

export default Dossier
