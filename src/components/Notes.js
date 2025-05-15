import React, { Component } from 'react'
import axios from 'axios';
import { ToastContainer, toast, Bounce   } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
export default class Notes extends Component {


    constructor(props){
        super(props)

        this.state = {
            title:"",
            content:"",
            list:[],
            loding: true,
            title_update:"",
            content_update:"",
            note_id:""

        }

    }

   
    componentDidMount(){
        this.fetch_data()
    }

   
    fetch_data = async() => {
        const res = await axios.get("http://localhost:8080/notes")
        .then(res => {  
            if(!res.statusText) throw new Error(`Status: ${res.status}`)
            this.setState({list:res.data, loding:false})
        }).catch(err => {
            console.error(err);
            this.setState({loding:false})
        })
    }


   cardStatus(status){
        let card = document.getElementById("addCard");
        let form = document.getElementById("note-form");
        
        if(status){
            card.classList.remove('d-none')
        }else{
            form.reset()
            card.classList.add('d-none')
        }

   }
  
    
    
    changeInput({e, type}){
        this.setState({
            [type]: e.target.value
        })
        
    }   

    

    handelEditCard = (id, status, title = null, content = null) => {
        const edit_card = document.getElementById("editCard_" + id);
        if(status){
            const visibleCard = document.querySelector('.editCard:not(.d-none)');
            if(visibleCard !== null){
                const cardid = visibleCard.id
                const prevEditCard = document.getElementById(cardid);
                prevEditCard.classList.add('d-none')
            }
            
            if(edit_card){
                this.setState({
                    title_update:title,
                    content_update:content,
                    note_id:id
                })
                edit_card.classList.remove('d-none');
            }
        }else{     
              this.setState({
                    title_update:"",
                    content_update:"",
                    id:""
                })       
            edit_card.classList.add('d-none');
        }
    }

    contentList() {
        const { list, loading } = this.state;

        if (loading) {
            return <div>Loading…</div>;
        }

        if (list.length === 0) {
            return <div>No notes yet!</div>;
        }

        return (
            <ol>
                {list.map(data => (
                    <li key={data.id}>
                        <div className="d-flex justify-content-between mt-2">
                            <div className='d-flex gap-3'>
                                <div>{data.title}</div>
                                <div>{data.content}</div>
                            </div>
                            <div>
                                <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                                    <button type="button" class="btn btn-warning" onClick={() => this.handelEditCard(data.id, true, data.title, data.content)}>edit</button>
                                    <button type="button" class="btn btn-danger" onClick={() => this.handelDeletion(data.id)}>dete</button>
                                </div>
                            </div>
                        </div>
                        <div className="card editCard d-none mt-2" id={'editCard_'+data.id}>
                            <div className="card-body">
                                <form id='note-form' onSubmit={this.handleUpdate}>
                                    <div class="mb-3">
                                        <label for="title_update" className="form-label">Title</label>
                                        <input type='text' name='title_update' id='title_update' className='form-control' value={this.state.title_update} onChange={(e) => this.changeInput({e, type:"title_update"})}></input>
                                    </div>
                                    <div class="mb-3">
                                        <label for="content_update" className="form-label">Content</label>
                                        <textarea  id='content_update' name='content_update' className='form-control' rows="3" value={this.state.content_update} onChange={(e) => this.changeInput({e, type:"content_update"})}></textarea>
                                    </div>
                                    <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                                        <button  class="btn btn-success me-md-2" type="submit">Save</button>
                                        <button class="btn btn-secondary" type="button" onClick={() => this.handelEditCard(data.id, false)}>Cancel</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </li>

                ))}
            </ol>
        );
    }

    notify = (type, message) => toast[type](message, {
                                position: "top-right",
                                autoClose: 2000,
                                hideProgressBar: false,
                                closeOnClick: false,
                                pauseOnHover: true,
                                draggable: true,
                                progress: undefined,
                                theme: "light",
                                transition: Bounce,
                                });


    handelDeletion = async (id) =>{
        axios.post('http://localhost:8080/delete', {id})
        .then(res => {
            if(res.status !== 200){
              this.cardStatus(false)
              this.notify('error', res.data);
               return; 
            }  
            if(res.data === "success"){
                this.componentDidMount()
                this.notify('success', 'Notes has been deleted successfully');
            } 
            
        })
    }


    handelSubmit = async(e) => {
        e.preventDefault()

        const {title, content} = this.state;

        const note = axios.post('http://localhost:8080/insert',{title, content})
        .then(res => {
            if(res.status !== 200){
              this.cardStatus(false)  
              this.notify('error', res.data);
               return; 
            }  
            if(res.data === "success"){
                this.componentDidMount()
                this.cardStatus(false)
                this.notify('success', 'Note has been saved successfully')
            } 
        })
            
    


    }

    handleUpdate = async (e) => {
        e.preventDefault();

        const {title_update, content_update, note_id} = this.state

        axios.post('http://localhost:8080/update', {title_update, content_update, note_id})
        .then(res => {

             if(res.status !== 200){
              this.handelEditCard(note_id ,false)  
              this.notify('error', res.data);
               return; 
            }  
            if(res.data === "success"){
                this.componentDidMount()
                this.handelEditCard(note_id, false)
                this.notify('success', 'Note has been updated successfully')
            } 
            
        })
    }

    
    

    render() {
    return (
      <div className='container py-4'>
        <div id='alertContainer'>
            <ToastContainer
            position="top-right"
            autoClose={2000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick={false}
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            transition={Bounce}
            />
        </div>
        <div className='d-flex justify-content-between align-items-center mb-4'>
            <div>
                <h1>Quick Notes 📝</h1>
            </div>
            <div>
                <button className='btn btn-primary' 
                onClick={() => this.cardStatus(true)}
                > + Add Notes</button>
            </div>
        </div>
        <div className="card d-none" id='addCard'>
            <div className="card-body">
                <form id='note-form' onSubmit={this.handelSubmit}>
                    <div class="mb-3">
                        <label for="title" className="form-label">Title</label>
                        <input type='text' name='title' id='title' className='form-control' value={this.state.title} onChange={(e) => this.changeInput({e, type:"title"})}></input>
                    </div>
                    <div class="mb-3">
                        <label for="content" className="form-label">Content</label>
                        <textarea  id='content' name='content' className='form-control' rows="3" value={this.state.content} onChange={(e) => this.changeInput({e, type:"content"})}></textarea>
                    </div>
                    <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                        <button  class="btn btn-success me-md-2" type="submit">Save</button>
                        <button class="btn btn-secondary" type="button" onClick={() => this.cardStatus(false)}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>

        <div className='mt-2'>
                {this.contentList()}
        </div>
      </div>
    )
  }


 

}
