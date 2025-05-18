import React, { Component } from 'react'
import axios from 'axios';
import { ToastContainer, toast, Bounce   } from 'react-toastify';
import { FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faPlus, faPencil, faTrashCan, faSearch } from "@fortawesome/free-solid-svg-icons"; // import specific icons
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
        await axios.get("http://localhost:8080/notes")
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
            card.classList.add("fade-in");
            setTimeout(() => {
                card.classList.add("show"); 
            }, 30);
        }else{
            form.reset()
            card.classList.remove("show"); 
            setTimeout(() => {
                card.classList.add("d-none");
                card.classList.remove("fade-in"); 
            }, 300); 
        }

   }
  
    
    
    changeInput({e, type}){
        this.setState({
            [type]: e.target.value
        })
        
    }   

    

    handelEditCard = (id, status, title = null, content = null) => {
        const edit_card = document.getElementById("editCard_" + id);
        const infoCard = document.getElementById('info_card_'+id);
        if(status){
            const visibleCard = document.querySelector('.editCard:not(.d-none)');
            const hiddeninfoCard = document.querySelector('.info_card.d-none');
            if(visibleCard !== null){
                const cardid = visibleCard.id
                const prevEditCard = document.getElementById(cardid);
                prevEditCard.classList.add('d-none')
            }

            if(hiddeninfoCard !== null){
                const hiddeninfoCardId = hiddeninfoCard.id;
                const previnfoCard = document.getElementById(hiddeninfoCardId);
                previnfoCard.classList.remove('d-none')
            }
            
            if(edit_card){
                this.setState({
                    title_update:title,
                    content_update:content,
                    note_id:id
                })
                edit_card.classList.remove('d-none');
                infoCard.classList.add('d-none');
            }
        }else{     
              this.setState({
                    title_update:"",
                    content_update:"",
                    id:""
                })       
            infoCard.classList.remove('d-none');    
            edit_card.classList.add('d-none');
        }
    }

    contentList() {
        const { list, loading } = this.state;

        if (loading) {
            return <div>Loading…</div>
        }

        if (list.length === 0) {
            return <div>No notes yet!</div>
        }

        return (
            <div className='container'>
                <div className='row row-cols-2 g-2'>
                        {list.map(data => (
                            <div className='col'>
                                <div key={data.id} className='card mt-2 info_card shadow-sm z-3' id={`info_card_`+data.id}>
                                    <div className='card-body'>
                                        <div className="d-flex justify-content-between mt-2">
                                            <div>
                                            <h5 class="card-title">{data.title}</h5>
                                                <div>{data.content}</div>
                                            </div>
                                            <div className='row'>
                                                <div className='d-md-grid justify-content-md-end'>
                                                    <small className="text-muted"> created at: {new Date(data.created_at).toLocaleString()}</small>
                                                    <small className="text-muted"> {data.updated_at !== null ?  `updated at: ` + new Date(data.updated_at).toLocaleString(): "" }</small>
                                                </div>
                                                <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                                                    <button type="button" class="btn btn-sm edit-btn" onClick={() => this.handelEditCard(data.id, true, data.title, data.content)}><FontAwesomeIcon icon={faPencil} /></button>
                                                    <button type="button" class="btn btn-sm delete-btn" onClick={() => this.handelDeletion(data.id)}><FontAwesomeIcon icon={faTrashCan} /></button>
                                                </div>
                                            </div>
                                        </div>
                                
                                    </div>
                                </div>
                                <div className="card editCard d-none mt-2 shadow-sm" id={'editCard_'+data.id}>
                                    <div className="card-body">
                                        <div className='d-flex justify-content-between'>
                                            <div>
                                                <h5 class="card-title">Edit Note</h5>
                                            </div>
                                            <div>
                                                <button type="button" class="btn-close" aria-label="Close" onClick={() => this.handelEditCard(data.id, false)}></button>
                                            </div>
                                        </div>
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
                            </div>
                        ))}
                    </div>
            </div>
            
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
                > <FontAwesomeIcon icon={faPlus} /> Add Notes</button>
            </div>
        </div>
        <div className="card d-none shadow-sm" id='addCard'>
            <div className="card-body">
                <div className='d-flex justify-content-between'>
                    <div>
                        <h5 class="card-title">Add Note</h5>
                    </div>
                    <div>
                        <button type="button" class="btn-close" aria-label="Close" onClick={() => this.cardStatus(false)}></button>
                    </div>
                </div>
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
