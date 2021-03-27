import React, { useState, useEffect } from 'react'
import taskService from './services/tasks'
import TaskForm from './components/TaskForm'
import './App.css';

const App = () => {
    
    const [completed, setCompleted] = useState()
    const [failed, setFailed] = useState()
    const [cancelled, setCancelled] = useState()
    const [scheduled, setScheduled] = useState()
    useEffect(() => {
        const returnCompleted = async () => { 
            setCompleted(await taskService.getCompleted())
        }
        returnCompleted()
    }, [completed])

    useEffect(() => {
        const returnCancelled = async () => { 
            setCancelled(await taskService.getCancelled())
        }
        returnCancelled()
    }, [cancelled])
    useEffect(() => {
        const returnFailed = async () => { 
            setFailed(await taskService.getFailed())
        }
        returnFailed()
    }, [failed])

    useEffect(() => {
        const returnScheduled = async () => { 
            setScheduled(await taskService.getScheduled())
        }
        returnScheduled()
    }, [scheduled])

    const onChangeValue = (event) => {
        event.preventDefault()
        console.log(event.target.value)
    }
    return (
        <div>
            <TaskForm />
            {/* <h1>Show Task</h1>
            <div onChange = {onChangeValue}>
                <input type="radio" value="completed" name="gender" /> Male
                <input type="radio" value="failed" name="gender" /> Female
                <input type="radio" value="Other" name="gender" /> Other
            </div> */}
        </div>
    )
}

export default App