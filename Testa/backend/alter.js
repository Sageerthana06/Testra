const pool = require('./db');

const query = `
  ALTER TABLE sales_orders RENAME COLUMN customer_id TO customer_name;
  ALTER TABLE sales_orders RENAME COLUMN status TO invoice_status;
  ALTER TABLE sales_orders RENAME COLUMN created_by TO marketing_id;
  ALTER TABLE sales_orders ADD COLUMN branch_id VARCHAR(255);
  ALTER TABLE sales_orders ADD COLUMN account_id VARCHAR(255);
`;

pool.query(query)
  .then(() => {
    console.log('Altered successfully');
    process.exit(0);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
