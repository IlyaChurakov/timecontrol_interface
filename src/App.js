import "./App.css"
import { Routes, Route } from "react-router-dom"
import Table from "./components/Table/Table"
import Header from "./components/Header/Header"
import DataViewer from "./components/DataViewer/DataViewer"
import Cameras from "./components/Cameras/Cameras"
import NotFound from "./components/NotFound/NotFound"
import OneC from "./components/OneC/OneC"
import Dossier from "./components/Dossier/Dossier"
import Reporting from "./components/Reporting/Reporting"

function App() {
	return (
		<div className='App'>
			<Header />
			<Routes>
				<Route path='/' element={<Cameras />} />
				<Route path='/database' element={<Table />} />
				<Route path='/reports' element={<Reporting />} />
				<Route path='/onec' element={<NotFound />} />
				<Route path='*' element={<NotFound />} />
			</Routes>
		</div>
	)
}

export default App
