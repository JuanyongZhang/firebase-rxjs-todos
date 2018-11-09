///<reference types="firebase"/>
declare var firebase: firebase.app.App;

import { Component, State } from '@stencil/core';
import { authState } from 'rxfire/auth';
import { switchMap } from 'rxjs/operators';
import { collectionData } from 'rxfire/firestore';


@Component({
  tag: 'my-component',
  styleUrl: 'my-component.css',
  shadow: true
})
export class MyComponent {

  @State() todos;
  @State() user;

  ref = firebase.firestore().collection('todos');

  componentWillLoad() {
    authState(firebase.auth()).subscribe(u => this.user = u)
    //Get user todos
    authState(firebase.auth())
      .pipe(
        switchMap(user => {
          //define query
          if (user) {
            const query = this.ref.where('userId', '==', user.uid);
            return collectionData(query, 'taskId');
          } else {
            return [];
          }
        })
      )
      .subscribe(todos => this.todos = todos)
  }

  login() {
    const provider = new (firebase.auth as any).GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider);
  }

  logout() {
    firebase.auth().signOut();
  }

  addTask(user) {
    this.ref.add({ userId: user.uid, task: 'blank task' });
  }

  removeTask(id) {
    this.ref.doc(id).delete();
  }



  render() {
    if (this.user) {
      return <div>Hello, World! I'm {this.user.displayName}[{this.user.uid}]
        <button onClick={this.logout}>Logout</button>
        <hr />
        <ul>
          {this.todos && this.todos.map(todo => (
            <li onClick={() => this.removeTask(todo.taskId)}>
              Task: {JSON.stringify(todo)}
            </li>
          ))}
        </ul>
        <button onClick={() => this.addTask(this.user)}>Add Task</button>
      </div>
    } else {
      return <div><button onClick={this.login}>Login with Google</button></div>
    }
  }
}
