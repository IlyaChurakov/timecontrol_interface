import "./header.css"
import { Link } from "react-router-dom"

const Header = props => {
	return (
		<div className='header'>
			<Link to='/' className='button'>
				Камеры
			</Link>
			<Link to='/reports' className='button'>
				Отчетность
			</Link>
			<Link to='/map' className='button'>
				Карта офиса
			</Link>
			<Link to='/database' className='button'>
				СКУД
			</Link>
			<Link to='/onec' className='button'>
				1С:ЗУП
			</Link>
		</div>
	)
}

export default Header
