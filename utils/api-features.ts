interface QueryString {
  [key: string]: string | string[] | undefined;
}

export class APIFeatures {
  private query: any;
  private queryString: QueryString;

  constructor(query: any, queryString: QueryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1B) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    const sortParam = this.queryString.sort;

    if (typeof sortParam === 'string') {
      const sortBy = sortParam.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    const fieldsParam = this.queryString.fields;

    if (typeof fieldsParam === 'string') {
      const fields = fieldsParam.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    const pageStr = Array.isArray(this.queryString.page)
      ? this.queryString.page[0]
      : this.queryString.page;

    const limitStr = Array.isArray(this.queryString.limit)
      ? this.queryString.limit[0]
      : this.queryString.limit;

    const page = pageStr ? parseInt(pageStr, 10) : 1;
    const limit = limitStr ? parseInt(limitStr, 10) : 100;

    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}
