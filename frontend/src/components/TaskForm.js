import React, { useState } from 'react'
import taskService from '../services/tasks'

const TaskForm = () => {
    const [taskUrl, setTaskUrl] = useState('')
    const [delay, setDelay] = useState(0)

    const taskFormSubmit = async (event) => {
        event.preventDefault()
        console.log(event.target.value)
        const taskToSchedule = {
            taskUrl : taskUrl,
            delay: Number(delay),
            requestData: {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: null
            }
        }

        try {
            await taskService.scheduleTask(taskToSchedule)
            setTaskUrl('')
            setDelay(0)
        }
        catch(error) {
            alert(error)
        }

    }

    return (
        <div>
            <h1>Schedule Task</h1>
            <form onSubmit = {taskFormSubmit} >
                <div>
                    taskurl: <input value = {taskUrl} onChange = {({target}) => setTaskUrl(target.value)}/>
                </div>
                <div>
                    delay: <input value = {delay} onChange = {({target}) => setDelay(target.value)}/>
                </div>
                <button type = 'submit'>Schedule</button>
            </form>
        </div>
    )
}

export default TaskForm