from flask import Flask, jsonify, request, has_request_context
import pymongo
from bson.objectid import ObjectId
import settings
import requests
from datetime import datetime
from celery import Celery
from celery.task.control import revoke
from sqlitedict import SqliteDict
from flask_cors import CORS

port = 5000

app = Flask(__name__, instance_relative_config=True)
app.config.from_object(settings)
cors = CORS(app)
task_celery_map = SqliteDict('./task_celery.sqlite', autocommit=True)
client = pymongo.MongoClient(app.config['DATABASE_URI'])
db = client['AWS-Task-Scheduler']
tasks = db['Tasks']
tasks_by_status = db['TasksByStatus']
tasks_by_status_id = ObjectId(list(tasks_by_status.find({}))[0]['_id'])
print('tasks_by_status_id', tasks_by_status_id)

celery_app = Celery(app.name, backend='rpc://', broker = 'pyamqp://guest@localhost//')
celery_app.conf.update(app.config)

def update_task_status(id, state, unset=False):
    tasks_by_status.update_one({'_id': tasks_by_status_id}, {"${}".format("unset" if unset else "set"): {"{}.{}".format(state, id): True}}, upsert=False)
    if not unset:
        tasks.update_one({'_id': ObjectId(id)}, {"$set": {"taskStatus": state}})

@app.route('/controller', methods=['POST'])
def dbquery():
    data = request.json
    # print('dbquery',data)
    update_task_status(**data)
    return {
        'this': 'works'
    }

def send_request(id, state, unset):
    data = {
        'id': str(id),
        'state': state,
        'unset': unset
    }
    # print('send_req',data)
    res = requests.post('http://127.0.0.1:5000/controller', json=data,
    headers={
        'Content-Type': 'application/json'
    })
    print(res.text)

# decorator for celery
@celery_app.task
def executeTask(data, id):
    try:
        # SCHEDULED ----> RUNNING
        send_request(id, "SCHEDULED", unset=True)
        send_request(id, "RUNNING", unset=False)
        res = requests.request(method=data['requestData']['method'],
            url=data['taskUrl'],
            data=data['requestData']['body'],
            headers=data['requestData']['headers'])

        send_request(id, "RUNNING", unset=True)
        if res.ok:
            # update db with task status = completed
            # RUNNING -> COMPLETED
            send_request(id, "COMPLETED", unset=False)
            pass

        else:
            # error, set task status as failure
            # RUNNING -> FAILURE
            send_request(id, "FAILED", unset=False)
            pass

    except Exception as e:
        # error, set task status as failure
        send_request(id, "FAILED", unset=False)
        pass



@app.route('/')
def home():
    return {
        'this': 'works'
    }

@app.route('/testtask', methods=['GET', 'POST'])
def tp():
    # print('request data', request.data)
    print('request at timestamp',datetime.now())
    from time import sleep
    from random import randint
    sleep(randint(1,6))
    return {'this': 'works'}




@app.route('/schedule', methods=['POST'])
def schedule():
    data_to_insert = request.json
    data_to_insert['timestamp'] = datetime.now()
    data_to_insert['taskStatus'] = "SCHEDULED"
    row = tasks.insert_one(data_to_insert)
    id = str(row.inserted_id)
    row = tasks_by_status.update_one({'_id': tasks_by_status_id}, {"$set": {"SCHEDULED.{}".format(id): True}}, upsert=False)
    data_to_insert.pop('_id')
    print(data_to_insert, id, type(id))
    with app.app_context():
        result = executeTask.apply_async(args=(data_to_insert, id), countdown= data_to_insert['delay'])
        print(str(result))
        task_celery_map[str(id)] = str(result)
        print(list(task_celery_map.items()))
    return jsonify({'id': id})

def cancel_task(task_id):
    celery_task_id = task_celery_map[task_id]
    revoke(celery_task_id, terminate = True)
    cursor = tasks.find({ '_id': ObjectId(task_id)})
    status = list(cursor)[0]['taskStatus']
    update_task_status(task_id, status, unset=True)
    update_task_status(task_id, "CANCELLED")

@app.route('/cancel/<task_id>', methods = ['PUT'])
def cancel(task_id):
    cancel_task(task_id)
    # TODO: add error handling for task_id which does not exist
    return '', 200


@app.route('/modify/<task_id>', methods = ['PUT'])
def modify(task_id):
    data = request.json
    cancel_task(task_id)
    cursor = tasks.find({'_id': ObjectId(task_id)})
    row = list(cursor)[0]
    row.pop('_id')
    with app.app_context():
        result = executeTask.apply_async(args=(row, task_id), countdown=data['delay'])
        # print(str(result))
        task_celery_map[str(id)] = str(result)
        # print(list(task_celery_map.items()))
        update_task_status(task_id, row['taskStatus'], unset=True)
        update_task_status(task_id, "SCHEDULED")
    return '', 200



@app.route('/checkStatus/<task_id>', methods = ['GET'])
def check_status(task_id):
    cursor = tasks.find({ '_id': ObjectId(task_id)})
    status = list(cursor)[0]['taskStatus']
    return {
        'taskId': task_id,
        'status': status
    }

@app.route('/retrieveTaskData/<task_id>')
def get_task_data(task_id):
    cursor = tasks.find({ '_id': ObjectId(task_id)})
    data = list(cursor)[0]
    data['_id'] = str(data['_id'])
    return {
        'data': data
    }

@app.route('/retrieveAllTasks/<status>', methods = ['GET'])
def get_all_tasks(status):
    dictionary = tasks_by_status.find({
        '_id': ObjectId(tasks_by_status_id)
    },{
        status: 1
    })[0][status]
    task_ids = list(map(lambda x: str(x), dictionary.keys()))
    return {
        'status': status,
        'data': task_ids
    }

if __name__ == '__main__':
    app.run(port=port, debug=True)
