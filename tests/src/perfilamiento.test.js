const { getColumns } = require("../../modules/analytics/models/perfilamientoFile");
const { 
    MockPerfilamientoFile,
    MockResponseGetColumns 
} = require("../mocks");


describe('Perfilamientos', () => {

    it('GET Columns, Calculo', async () => {
        const columnsFunction = jest.fn(mock => getColumns(mock));

        const getColumnsFN = await columnsFunction(MockPerfilamientoFile);
        expect(columnsFunction.mock.calls.length).toBe(1);

        expect(getColumnsFN).toEqual(MockResponseGetColumns);
    })
})