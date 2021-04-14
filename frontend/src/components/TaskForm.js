import React, { useState } from 'react'
import taskService from '../services/tasks'

const TaskForm = (props) => {
    const [taskUrl, setTaskUrl] = useState('')
    const [delay, setDelay] = useState(0)
    const [method, setMethod] = useState('GET')
    const [headers, setHeaders] = useState('')
    const [payload, setPayload] = useState('')
    const taskFormSubmit = async (event) => {
        event.preventDefault()
        console.log(event.target.value)

        try {
            const taskToSchedule = {
                taskUrl : taskUrl,
                delay: Number(delay),
                requestData: {
                    method: method,
                    headers: JSON.parse(headers),
                    body: JSON.parse(payload)
                }
            }
            await taskService.scheduleTask(taskToSchedule)
            alert('Task scheduled successfully!')
            props.callback()
        }
        catch(error) {
            alert(error)
        }

    }

    return (
        <div className="task-form">
            <h1 className="text-center">Schedule Task</h1>
            <form className="d-flex flex-column justify-content-center align-items-center" onSubmit = {taskFormSubmit} >
                <div className="row">
                    <div className="form-group col-6">
                        <label>URL of task</label>
                        <input className="input-group" onChange = {({target}) => setTaskUrl(target.value)}/>
                    </div>
                    <div className="form-group col-3">
                        <label>Delay in sec</label>
                        <input className="input-group" onChange = {({target}) => setDelay(target.value)}/>
                    </div>
                    <div className="form-group col-3">
                        <label>HTTP method:</label>
                        <select className="form-control" onChange = {({target}) => setMethod(target.value)} >
                        {["GET", "POST", "PUT", "PATCH", "OPTIONS", "HEAD", "DELETE"].
                        map((method) => <option value={method}>{method}</option>)}
                        </select>
                    </div>
                </div>
                <div className="form-group col-4">
                    <label>Enter headers in JSON format or null for no headers:</label>
                    <textarea className="form-control" onChange = {({target}) => setHeaders(target.value)} rows="3"/>
                </div>
                <div className="form-group col-4">
                    <label>Enter payload or enter null for no payload</label>
                    <textarea className="form-control" onChange = {({target}) => setPayload(target.value)} rows="3"/>
                </div>
                <button className="btn btn-primary" type = 'submit'>Schedule</button>
            </form>
        </div>
    )
}

export default TaskForm
