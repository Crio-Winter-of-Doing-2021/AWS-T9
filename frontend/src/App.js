import React, { useState, useEffect } from 'react'
import taskService from './services/tasks'
import TaskForm from './components/TaskForm'
import Table from './components/Table'
import './App.css';
import useInterval from './hooks/setInterval'

const App = () => {
    // const [completed, setCompleted] = useState([])
    // const [failed, setFailed] = useState([])
    // const [cancelled, setCancelled] = useState([])
    // const [scheduled, setScheduled] = useState([])
    // const [running, setRunning] = useState([])
    const [tasks, setTasks] = useState({
        'COMPLETED': [],
        'FAILED': [],
        'CANCELLED': [],
        'SCHEDULED': [],
        'RUNNING': [],
    })
    const [status, setStatus] = useState("")
    const [clickFlag, setClickFlag] = useState(0)
    const getAllTasks = (tasks) => {
        let data = []
        for(let key of Object.keys(tasks)){
            data.push(...tasks[key])
        }
        return data
    }

    const updateData = () => {
        taskService.getTasksByStatus()
        .then((data) => {
            console.log('data is here', data);
            setTasks(data)
        })
    }

    useEffect(updateData, [clickFlag])
    // useInterval(updateData, 2000)

    const displayTasks = (event) => {
        event.preventDefault()
        // console.log(event.target.value)
        let value = event.target.value
        setStatus(value)
    }
    return (
        <div>
            <TaskForm callback={setClickFlag} clickFlag={clickFlag}/>
            <br />
            <div className="d-flex flex-column justify-content-center align-items-center">
                <div className="form-group col-6 text-center">
                <label>Filter by: </label>
                <select className="form-control" name="" onChange={displayTasks}>
                    <option value="">None</option>
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="RUNNING">Running</option>
                    <option value="FAILED">Failed</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                </select>
                </div>
            </div>
            <Table data={status !== "" ? tasks[status] : getAllTasks(tasks)} />
        </div>

    )
}

export default App
