const Product=require('../models/product')

// Testing API with hard-coded properties
const getAllProductsStatic= async (req,res)=>{
    const products = await Product.find({}).
    sort('price').
    select('name price')
    res.status(200).json({products,nbHits:products.length})
    }

// Actual API functionality  
const getAllProducts= async (req,res)=>{
    const {featured,company,name,sort,fields,numericFilters}=req.query
    const queryObject={}
    // filtering with featured 
    if(featured){
        queryObject.featured= featured==='true'?true:false
    }
    //filtering with company
    if(company){
        queryObject.company=company
    }
    //filtering with name using pattern match
    if(name){
        queryObject.name={$regex:name ,$options:'i'}
    }
    // filtering with numeric properties ex- price>40,rating=5
    if(numericFilters){
        const operatorMap={
            '>':'$gt',
            '>=':'$gte',
            '<':'$lt',
            '<=':'$lte',
            '=':'$eq'
        }
        const regEx=/\b(<|>|>=|=|<|<=)\b/g
        let filters=numericFilters.replace(
            regEx,
            (match)=>`-${operatorMap[match]}-`)  

        const options=['price','rating']
        filters=filters.split(',').forEach((item)=>{
            const [field,operator,value]=item.split('-')
            if(options.includes(field)){
                queryObject[field]={[operator]:Number(value)}
            }
        })
    }
    
    let result=Product.find(queryObject)
    // selecting fields provided by user and only showing them in the response
    if(fields){
        const fieldList=fields.split(',').join(' ')
        result=result.select(fieldList)

    }
    // sorting acording to specific field
    if(sort){
        const sortList=sort.split(',').join(' ')
        result=result.sort(sortList)
    }
    else{
        result=result.sort('createdAt')
    }
    
    // Pagination
    const page=Number(req.query.page) || 1
    const limit=Number(req.query.limit) 
    const skip=(page-1)*limit
    result=result.skip(skip).limit(limit)

    const products=await result
    res.status(200).json({products,nbHits:products.length})

}

module.exports={getAllProducts,getAllProductsStatic}