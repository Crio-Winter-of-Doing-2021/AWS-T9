
const NavBar = (props) => {
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <a className="navbar-brand" href="#">AWS-Task-Scheduler</a>
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
                <div className="navbar-nav">
                    <a href="#" className={`nav-item nav-link ${(props.currentLink === "schedule") ? "active" : ""}`} onClick={() => props.callback("schedule")}>Schedule task </a>
                    <a href="#" className={`nav-item nav-link ${(props.currentLink === "view-all") ? "active" : ""}`} onClick={() => props.callback("view-all")}>View all tasks</a>
                </div>
            </div>
        </nav>
    )
}

export default NavBar
