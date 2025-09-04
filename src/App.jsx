import React, { useState } from 'react'
import {Button, Form, Table} from 'react-bootstrap'
import Swal from 'sweetalert2'
const ReceipePage = () => {

  const [receipe ,setReceipe] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mealDetails, setMealDetails] = useState({});


  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchReceipes =async(ingrediant)=>{
    if(!ingrediant.trim()){
      setError('Please enter an Ingrediant');
      setReceipe([]);
      return;
    }
    setLoading(true);
    setError("")

    try {
      const res =await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ingrediant)}`);
      const data = await res.json()
      console.log(`Receipes Data`, data);
      if(data.meals){
        console.log('Data.Meals are', data.meals);
        setReceipe(data.meals);

        // fetch details for each meal
        data.meals.forEach(async (meal) => {
          try {
            const res2 = await fetch(
              `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`
            );
            const detailData = await res2.json();
            if (detailData.meals && detailData.meals[0]) {
              setMealDetails((prev) => ({
                ...prev,
                [meal.idMeal]: detailData.meals[0],
              }));
            }
          } catch (err) {
            console.error("Error fetching details", err);
          }
        });
      }else{
        setReceipe([]);
        Swal.fire({
          title: 'Error!',
          text: `No Recepies are found for ${ingrediant}`,
          icon: 'error',
          confirmButtonText: 'Cool',
          timer: 2000
        })
        setError( `No Recepies are found for ${ingrediant}`)
      }
    } catch (error) {
      console.log(error)
      setError(`Failed To fetch Receipes`)
    }finally{
      setLoading(false)
    }
  }

  const fetchMealDetails = async(idMeal)=>{
    if (mealDetails[idMeal]) return; // cache so we don't refetch
  try {
    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${idMeal}`);
    const data = await res.json();
    if (data.meals && data.meals[0]) {
      setMealDetails((prev) => ({
        ...prev,
        [idMeal]: data.meals[0], // store details keyed by id
      }));
    }
  } catch (error) {
    console.error("Error fetching meal details", error);
  }
  }


  const handleSubmit=(e)=>{
    e.preventDefault();
    fetchReceipes(input);
    setInput('')

  }

  const totalPages = Math.ceil(receipe.length / itemsPerPage);

  // slice recipes for current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = receipe.slice(indexOfFirstItem, indexOfLastItem);

  // to display "showing X–Y of Z"
  const start = receipe.length > 0 ? indexOfFirstItem + 1 : 0;
  const end = Math.min(indexOfLastItem, receipe.length);
  return (
    <>
    <h2 className='text-center mt-5'>Welcome to @Receipe_Page</h2>

    <div className='mt-4'>
        <Form onSubmit={handleSubmit} className="mx-auto"  style={{ width: "60%" }}>
          <Form.Label className='fw-bold mb-2 text-center d-block'>Search Your Favourite Receipe</Form.Label>
          <div className="d-flex gap-3 align-items-center mx-4">
          <Form.Group  className="flex-grow-1">
            <Form.Control
              type='text'
              value={input}
              onChange={(e)=>setInput(e.target.value)}
              placeholder="Enter an ingredient (e.g., chicken)"
              required
            />
          </Form.Group>

          <Button variant='primary' type='submit' className='px-4' disabled={!input.trim() || loading}>
            {loading ? 'searching...': 'search'}
          </Button>
          </div>
        </Form>

        <small className="text-muted d-block mt-1 text-center">
          Try: chicken, salmon, rice, tomato, egg, eggs…
        </small>
        
      {/* displaying the Receipes */}
      {currentItems.length >0 ?
      <div className='container mt-5' style={{width: '80%'}}>

      <div className="d-flex justify-content-between align-items-center mx-3 my-2">
      {/* Items per page dropdown */}
      <div className="d-flex align-items-center gap-2">
        <label className="fw-bold">Items per page:</label>
        <select
          className="form-select w-auto"
          value={itemsPerPage}
          onChange={(e) => {
            setItemsPerPage(Number(e.target.value));
            setCurrentPage(1); // reset to first page on change
          }}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={15}>15</option>
        </select>
      </div>

      {/* Status */}
      <div>
        <span className="fw-bold">
          Showing {start}-{end} of {receipe.length} recipes
        </span>
      </div>
    </div>


      <div className='table-responsive'>
        <table className='table table-striped table-hover align-middle shadow-sm rounded'>
          <thead className='table-dark text-center'>
            <tr>
              <th scope='col'>S.No</th>
              <th scope="col">Meal Id</th>
              <th scope="col">Image</th>
              <th scope="col">Meal Name</th>
              <th>Category</th>
              <th>Area</th>
              <th>Instructions</th>
              <th scope="col">Action</th>
              <th scope="col">YouTube</th>
            </tr>
          </thead>
          <tbody>
          {currentItems.map((item, index) => {
            const details = mealDetails[item.idMeal]; //fecth details

            return (
              <tr key={item.idMeal} className='text-center'>
                <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                <td>{item.idMeal}</td>
                <td>
                  <img
                    src={item.strMealThumb}
                    alt={item.strMeal}
                    className='rounded'
                    style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                  />
                </td>
                <td>{item.strMeal}</td>
                <td>{details?.strArea || "-"}</td>
                <td>{details?.strCategory || "-"}</td>
                <td>
                  {
                    details?.strInstructions ? details.strInstructions.slice(0,100)+'...' : "-"
                  }
                </td>
                <td>
                  <a
                    href={`https://www.themealdb.com/meal/${item.idMeal}`}
                    target='_blank'
                    className='btn btn-sm btn-outline-primary'
                  >view Receipe</a>
                </td>
                <td>
                  {details ? (
                    details.strYoutube ? (
                      <a
                        href={details.strYoutube}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='btn btn-sm btn-danger'
                      >
                        ▶ Watch
                      </a>
                    ) : (
                      <span className="text-muted">No video</span>
                    )
                  ) : (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => fetchMealDetails(item.idMeal)}
                    >
                      Load Video
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="mt-3">
          <ul className="pagination justify-content-end">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </button>
            </li>

            {Array.from({ length: totalPages }, (_, i) => (
              <li
                key={i}
                className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
              >
                <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                  {i + 1}
                </button>
              </li>
            ))}

            <li
              className={`page-item ${
                currentPage === totalPages ? "disabled" : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      )}

    </div>
    : (
      <div className='container mt-4' style={{width: '80%'}}>
        <div className='table-responsive'>
          <table className='table table-striped table-hover align-middle shadow-sm rounded'>
            <thead className='table-dark text-center'>
              <tr>
                <th scope='col'>S.No</th>
                <th scope="col">Meal Id</th>
                <th scope="col">Image</th>
                <th scope="col">Meal Name</th>
                <th scope="col">Category</th>
                <th scope="col">Area</th>
                <th scope="col">Instructions</th>
                <th scope="col">Action</th>
                <th scope="col">YouTube</th>
              </tr>
            </thead>
            <tbody className='text-center fw-bold'>
                <tr>
                <td colSpan="9">
                  <h6 className="text-muted my-4">Please search for recipes above</h6>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
      
      }
      

    </div>
    </>
  )
}

export default ReceipePage








