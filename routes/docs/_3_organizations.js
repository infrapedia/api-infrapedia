/**
 * @swagger
 * /auth/organization/add:
 *   post:
 *     security:
 *     - bearerAuth: []
 *     tags:
 *       - Organizations
 *     description: Login
 *     produces:
 *      - application/json
 *     consumes:
 *      - application/x-www-form-urlencoded
 *     parameters:
 *      - in: formData
 *        name: name
 *      - in: formData
 *        name: notes
 *      - in: formData
 *        name: notes
 *      - in: formData
 *        name: address
 *      - in: formData
 *        name: premium
 *      - in: formData
 *        name: non_peering
 *     responses:
 *       200:
 *         description: Check status of API
 *         schema:
 *           type: array
 */
