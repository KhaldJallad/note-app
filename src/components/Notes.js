import React, { Component } from 'react'
import axios from 'axios';
export default class Notes extends Component {


    constructor(props){
        super(props)

        this.state = {
            title:"",
            content:"",
            list:[]
        }

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

    contentList(){
        if(this.state.list > 0){

        }else{
           return (
            <div>
                There is no task yet !
            </div>
           ) 
        }
    }


    handelSubmit = async(e) => {
        e.preventDefault()


        const {title, content} = this.state;


        try {
            
            const result = await axios.post("../api/notesBanckEnd.js",{
                title,
                content
            });

            this.cardStatus(false);
        } catch (error) {
            console.error('Error saving note:', err);
            alert("Failed to save note. Please try again.");
        }

    }


    render() {
    return (
      <div className='container py-4'>
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
                        <input type='text' id='title' className='form-control' value={this.state.title} onChange={(e) => this.changeInput({e, type:"title"})}></input>
                    </div>
                    <div class="mb-3">
                        <label for="Content" className="form-label">Content</label>
                        <textarea  id='Content' className='form-control' rows="3" value={this.state.content} onChange={(e) => this.changeInput({e, type:"content"})}></textarea>
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
