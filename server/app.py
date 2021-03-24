from flask import Flask, jsonify, request, has_request_context
import pymongo
from bson.objectid import ObjectId
import settings
import requests
from datetime import datetime
from celery import Celery
# from celery.app.control import Inspect

port = 5000

app = Flask(__name__, instance_relative_config=True)
app.config.from_object(settings)
client = pymongo.MongoClient(app.config['DATABASE_URI'])
db = client['AWS-Task-Scheduler']
tasks = db['Tasks']
tasks_by_status = db['TasksByStatus']
tasks_by_status_id = ObjectId(list(tasks_by_status.find({}))[0]['_id'])
print('tasks_by_status_id', tasks_by_status_id)

celery_app = Celery(app.name, backend='rpc://', broker = 'pyamqp://guest@localhost//')
celery_app.conf.update(app.config)

print('name', app.name)

def update_db(id, state, unset=False):
    tasks_by_status.update_one({'_id': tasks_by_status_id}, {"${}".format("unset" if unset else "set"): {"{}.{}".format(state, id): True}}, upsert=False)

@app.route('/dbquery', methods=['POST'])
def dbquery():
    data = request.json
    # print('dbquery',data)
    update_db(**data)
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
    res = requests.post('http://127.0.0.1:5000/dbquery', json=data,
    headers={
        'Content-Type': 'application/json'
    })
    print(res.text)

# decorator for celery
@celery_app.task
def executeTask(data, id):
    # with open('file.txt', 'w') as f:
    #     f.write(str(data))
    try:
        # SCHEDULED ----> RUNNING
        
        # tasks_by_status.update_one({'_id': tasks_by_status_id}, {"$unset": {"SCHEDULED.{}".format(data['_id']): True}}, upsert=False)
        # tasks_by_status.update_one({'_id': tasks_by_status_id}, {"$set": {"RUNNING.{}".format(data['_id']): True}}, upsert=False)
        send_request(id, "SCHEDULED", unset=True)
        send_request(id, "RUNNING", unset=False)
        res = requests.request(method=data['requestData']['method'], 
            url=data['taskUrl'], 
            data=data['requestData']['body'], 
            headers=data['requestData']['headers'])

        # tasks_by_status.update_one({'_id': tasks_by_status_id}, {"$unset": {"RUNNING.{}".format(id): True}}, upsert=False)
        send_request(id, "RUNNING", unset=True)
        if res.ok:
            # update db with task status = completed
            # RUNNING -> COMPLETED    
            # tasks_by_status.update_one({'_id': tasks_by_status_id}, {"$set": {"COMPLETED.{}".format(id): True}}, upsert=False)
            send_request(id, "COMPLETED", unset=False)
            pass

        else:
            # error, set task status as failure
            # RUNNING -> FAILURE
            # tasks_by_status.update_one({'_id': tasks_by_status_id}, {"$set": {"FAILED.{}".format(id): True}}, upsert=False)
            send_request(id, "FAILED", unset=False)
            pass

    except:
        # error, set task status as failure
        # tasks_by_status.update_one({'_id': tasks_by_status_id}, {"$set": {"FAILED.{}".format(id): True}}, upsert=False)
        send_request(id, "FAILED", unset=False)
        pass



@app.route('/')
def home():
    return {
        'this': 'works'
    }

@app.route('/testtask')
def tp():
    print('request at timestamp',datetime.now())
    return {'this': 'works'}




@app.route('/schedule', methods=['POST'])
def schedule():
    # print(request.json)
    # return jsonify({
        # 'this': 'works'
    # })
    data_to_insert = request.json
    data_to_insert['timestamp'] = datetime.now()
    data_to_insert['taskStatus'] = "SCHEDULED"
    row = tasks.insert_one(data_to_insert)
    id = str(row.inserted_id)
    row = tasks_by_status.update_one({'_id': tasks_by_status_id}, {"$set": {"SCHEDULED.{}".format(id): True}}, upsert=False)
    
    
    # print('data_to_insert', data_to_insert)
    data_to_insert.pop('_id')
    print(data_to_insert, id, type(id))
    with app.app_context():
        result = executeTask.apply_async(args=(data_to_insert, id), countdown= data_to_insert['delay'])
    # print(result, dir(result), type(result))
    # from time import sleep
    # for i in range(10):
    #     print('status',result.status)
    #     print('retries', result.retries)
    #     sleep(1)
    return jsonify({'id': id})


@app.route('/cancel/<task_id>', methods = ['PUT'])
def cancel():
    print(request.json)

@app.route('/modify/<task_id>', methods = ['PUT'])
def modify():
    print(request.json)

@app.route('/checkStatus/<task_id>', methods = ['GET'])
def checkStatus():
    print(request.json)


if __name__ == '__main__':
    app.run(port=port, debug=True)
